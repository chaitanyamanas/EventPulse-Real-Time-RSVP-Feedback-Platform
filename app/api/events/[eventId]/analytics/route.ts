import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface WordCount {
  [key: string]: number;
}

type FeedbackType = {
  comment: string;
  emoji?: string | null;
  createdAt: Date;
}

type RSVPType = {
  checkedIn: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        rsvps: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        feedback: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          select: {
            comment: true,
            emoji: true,
            createdAt: true,
          },
        },
      },
    });

    if (!event) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Calculate RSVP statistics
    const rsvpStats = event.rsvps.reduce((acc: { total: number; checkedIn: number }, rsvp: RSVPType) => {
      acc.total++;
      if (rsvp.checkedIn) acc.checkedIn++;
      return acc;
    }, { total: 0, checkedIn: 0 });

    // Calculate emoji frequencies
    const emojiCounts = event.feedback.reduce((acc: { [key: string]: number }, fb: FeedbackType) => {
      if (fb.emoji) {
        acc[fb.emoji] = (acc[fb.emoji] || 0) + 1;
      }
      return acc;
    }, {});

    // Sort emojis by frequency
    const sortedEmojis = Object.entries(emojiCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Calculate word frequencies in feedback
    const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);
    const words = event.feedback
      .flatMap((fb: FeedbackType) => fb.comment.toLowerCase().split(/\W+/))
      .filter((word: string) => word.length > 2 && !stopWords.has(word));

    const wordFrequencies = words.reduce((acc: WordCount, word: string) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const analytics = {
      rsvpStats,
      emojiStats: sortedEmojis,
      wordFrequencies,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 