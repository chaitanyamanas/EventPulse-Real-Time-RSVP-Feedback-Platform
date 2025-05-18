import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Reaction } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.eventId;
    const { comment, reaction } = await req.json();

    // Validate event exists and is LIVE
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'LIVE') {
      return NextResponse.json({ error: 'Event is not live' }, { status: 400 });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        eventId,
        userId: session.user.id,
        comment,
        reaction: reaction as Reaction,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Failed to create feedback:', error);
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.eventId;
    const { searchParams } = new URL(req.url);
    const isPinned = searchParams.get('pinned') === 'true';
    const isFlagged = searchParams.get('flagged') === 'true';

    const feedback = await prisma.feedback.findMany({
      where: {
        eventId,
        ...(isPinned !== undefined ? { isPinned } : {}),
        ...(isFlagged !== undefined ? { isFlagged } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'HOST' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackId, isPinned, isFlagged } = await req.json();

    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        isPinned: isPinned !== undefined ? isPinned : undefined,
        isFlagged: isFlagged !== undefined ? isFlagged : undefined,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Failed to update feedback:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
} 