import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const feedbackSchema = z.object({
  content: z.string().min(1, 'Feedback content is required'),
  emoji: z.string().optional(),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
    });

    if (!event) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (event.status !== "LIVE") {
      return new NextResponse("Event not live", { status: 400 });
    }

    const rsvp = await prisma.rSVP.findFirst({
      where: {
        eventId: params.eventId,
        userId: session.user.id
      },
    });

    if (!rsvp) {
      return new NextResponse("Not RSVPed", { status: 400 });
    }

    const data = await request.json();

    if (!data.rating || !data.comment) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        eventId: params.eventId,
        userId: session.user.id
      },
    });

    if (existingFeedback) {
      return new NextResponse("Feedback already exists", { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        eventId: params.eventId,
        userId: session.user.id,
        rating: parseInt(data.rating),
        comment: data.comment,
        emoji: data.emoji || null
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        eventId: params.eventId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// For hosts to pin/unpin or flag feedback
export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { hostId: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Only allow hosts to modify feedback
    if (event.hostId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the host can modify feedback' },
        { status: 403 }
      );
    }

    const { feedbackId, action } = await request.json();

    if (!['pin', 'unpin', 'flag'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        pinned: action === 'pin' ? true : action === 'unpin' ? false : undefined,
        flagged: action === 'flag' ? true : undefined,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Feedback modification error:', error);
    return NextResponse.json(
      { error: 'Failed to modify feedback' },
      { status: 500 }
    );
  }
} 