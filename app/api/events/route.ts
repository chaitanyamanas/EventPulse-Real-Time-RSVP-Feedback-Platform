import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { z } from 'zod';

// Validation schema for event creation
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dateTime: z.string().transform((str) => new Date(str)),
  timezone: z.string().min(1, 'Timezone is required'),
  location: z.string().min(1, 'Location is required'),
  rsvpDeadline: z.string().transform((str) => new Date(str)),
  maxAttendees: z.number().min(1, 'Maximum attendees must be at least 1'),
});

type EventInput = z.infer<typeof eventSchema>;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const hostId = searchParams.get('hostId');

    let where: any = {};
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by host if provided
    if (hostId) {
      where.hostId = hostId;
    }

    // Regular users can only see events they're RSVP'd to
    if (session.user.role === 'USER') {
      where.rsvps = {
        some: {
          userId: session.user.id,
        },
      };
    }
    
    // Hosts can only see their own events
    if (session.user.role === 'HOST') {
      where.hostId = session.user.id;
    }

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
        feedback: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in API:', session);

    if (!session?.user?.id || (session.user.role !== 'HOST' && session.user.role !== 'ADMIN')) {
      console.log('Unauthorized access attempt:', session?.user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received request body:', body);

    try {
      const validatedData = eventSchema.parse({
        ...body,
        maxAttendees: Number(body.maxAttendees),
      });
      console.log('Validated data:', validatedData);

      const event = await prisma.event.create({
        data: {
          ...validatedData,
          hostId: session.user.id,
        },
      });
      console.log('Created event:', event);

      return NextResponse.json(event);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors[0].message },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
