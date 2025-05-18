import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const { status = 'CONFIRMED' } = await req.json();

    // Check if event exists and is open for RSVPs
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.rsvpDeadline < new Date()) {
      return NextResponse.json({ error: 'RSVP deadline has passed' }, { status: 400 });
    }

    // Check if user has already RSVP'd
    const existingRSVP = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    });

    if (existingRSVP) {
      // Update existing RSVP
      const updatedRSVP = await prisma.rSVP.update({
        where: {
          id: existingRSVP.id,
        },
        data: {
          status: status as 'CONFIRMED' | 'CANCELLED' | 'WAITLIST',
        },
      });
      return NextResponse.json(updatedRSVP);
    }

    // Check if event is full
    if (event.rsvps.filter(r => r.status === 'CONFIRMED').length >= event.maxAttendees) {
      // Add to waitlist
      const rsvp = await prisma.rSVP.create({
        data: {
          eventId,
          userId: session.user.id,
          status: 'WAITLIST',
        },
      });
      return NextResponse.json(rsvp);
    }

    // Create new RSVP
    const rsvp = await prisma.rSVP.create({
      data: {
        eventId,
        userId: session.user.id,
        status: status as 'CONFIRMED' | 'CANCELLED' | 'WAITLIST',
      },
    });

    // Send confirmation email (mock)
    console.log(`[Email] RSVP confirmation sent to ${session.user.email} for event: ${event.title}`);

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error('Failed to create RSVP:', error);
    return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 });
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

    const rsvps = await prisma.rSVP.findMany({
      where: {
        eventId,
        ...(session.user.role === 'USER' ? { userId: session.user.id } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(rsvps);
  } catch (error) {
    console.error('Failed to fetch RSVPs:', error);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}

export async function DELETE(
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
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if RSVP deadline has passed
    if (new Date() > new Date(event.rsvpDeadline)) {
      return NextResponse.json(
        { error: 'RSVP deadline has passed' },
        { status: 400 }
      );
    }

    const rsvp = await prisma.rSVP.deleteMany({
      where: {
        eventId: params.eventId,
        userId: session.user.id,
      },
    });

    if (rsvp.count === 0) {
      return NextResponse.json(
        { error: 'RSVP not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'RSVP cancelled successfully' });
  } catch (error) {
    console.error('RSVP cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel RSVP' },
      { status: 500 }
    );
  }
} 