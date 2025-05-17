import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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
      include: {
        host: true,
        rsvps: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Only allow check-ins on the event day
    const eventDate = new Date(event.dateTime);
    const today = new Date();
    if (
      eventDate.getFullYear() !== today.getFullYear() ||
      eventDate.getMonth() !== today.getMonth() ||
      eventDate.getDate() !== today.getDate()
    ) {
      return NextResponse.json(
        { error: 'Check-in is only available on the event day' },
        { status: 400 }
      );
    }

    // Check if user has RSVP'd or is the host
    if (event.host.id !== session.user.id && event.rsvps.length === 0) {
      return NextResponse.json(
        { error: 'You must RSVP before checking in' },
        { status: 400 }
      );
    }

    // If user is an attendee, update their RSVP
    if (event.rsvps.length > 0) {
      const rsvp = event.rsvps[0];
      if (rsvp.checkedIn) {
        return NextResponse.json(
          { error: 'You have already checked in' },
          { status: 400 }
        );
      }

      const updatedRSVP = await prisma.rSVP.update({
        where: {
          id: rsvp.id,
        },
        data: {
          checkedIn: true,
        },
      });

      return NextResponse.json(updatedRSVP);
    }

    // If user is the host, just return success
    if (event.host.id === session.user.id) {
      return NextResponse.json({ message: 'Host check-in successful' });
    }

    return NextResponse.json(
      { error: 'Unable to process check-in' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}

// For hosts to check in walk-in attendees
export async function PUT(
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
      select: {
        hostId: true,
        maxAttendees: true,
        rsvps: {
          where: { checkedIn: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Verify the user is the host
    if (event.hostId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the host can check in walk-in attendees' },
        { status: 403 }
      );
    }

    // Check if event is at capacity
    if (event.maxAttendees && event.rsvps.length >= event.maxAttendees) {
      return NextResponse.json(
        { error: 'Event is at capacity' },
        { status: 400 }
      );
    }

    const { email } = await request.json();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create a temporary user account
      user = await prisma.user.create({
        data: {
          email,
          // Set a random password that can be reset later
          password: Math.random().toString(36).slice(-8),
        },
      });
    }

    // Create RSVP and check in
    const rsvp = await prisma.rSVP.create({
      data: {
        eventId: params.eventId,
        userId: user.id,
        checkedIn: true,
      },
    });

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error('Walk-in check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in walk-in attendee' },
      { status: 500 }
    );
  }
} 