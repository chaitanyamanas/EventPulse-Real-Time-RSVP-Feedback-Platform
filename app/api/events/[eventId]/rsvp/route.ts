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
      include: { rsvps: true },
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

    // Check if event is at capacity
    if (event.maxAttendees && event.rsvps.length >= event.maxAttendees) {
      return NextResponse.json(
        { error: 'Event is at capacity' },
        { status: 400 }
      );
    }

    // Check if user has already RSVPed
    const existingRSVP = await prisma.rSVP.findFirst({
      where: {
        eventId: params.eventId,
        userId: session.user.id,
      },
    });

    if (existingRSVP) {
      return NextResponse.json(
        { error: 'You have already RSVPed to this event' },
        { status: 400 }
      );
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        eventId: params.eventId,
        userId: session.user.id,
      },
    });

    // TODO: Send confirmation email (mock for now)
    console.log(`Sending confirmation email to ${session.user.email} for event ${event.title}`);

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json(
      { error: 'Failed to create RSVP' },
      { status: 500 }
    );
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