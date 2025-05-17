import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from 'zod';

// Validation schema for event creation
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dateTime: z.string().transform((str: string) => new Date(str)),
  location: z.string().min(1, 'Location is required'),
  rsvpDeadline: z.string().transform((str: string) => new Date(str)),
  maxAttendees: z.number().optional(),
});

type EventInput = z.infer<typeof eventSchema>;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const hostId = searchParams.get('hostId');

    const where = {
      ...(status && { status: status as 'SCHEDULED' | 'LIVE' | 'CLOSED' }),
      ...(hostId && { hostId }),
    };

    const events = await prisma.event.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        rsvps: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const json = await request.json();
    const validatedData = eventSchema.parse(json);

    // Ensure RSVP deadline is before event date
    if (validatedData.rsvpDeadline > validatedData.dateTime) {
      return NextResponse.json(
        { error: 'RSVP deadline must be before event date' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        ...validatedData,
        hostId: session.user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
