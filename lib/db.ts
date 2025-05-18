import { PrismaClient, Feedback, Reaction } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function getEvents(userId: string, userRole: string) {
  if (userRole === 'ADMIN') {
    return prisma.event.findMany({
      include: {
        host: true,
        rsvps: true,
        feedback: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  } else if (userRole === 'HOST') {
    return prisma.event.findMany({
      where: {
        hostId: userId,
      },
      include: {
        rsvps: true,
        feedback: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  } else {
    // Regular users see events they're RSVP'd to
    return prisma.event.findMany({
      where: {
        rsvps: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        host: true,
        rsvps: {
          where: {
            userId: userId,
          },
        },
        feedback: {
          where: {
            userId: userId,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }
}

export async function createEvent(data: any, hostId: string) {
  return prisma.event.create({
    data: {
      ...data,
      hostId,
    },
  });
}

export async function updateEventStatus(eventId: string, status: 'SCHEDULED' | 'LIVE' | 'CLOSED') {
  return prisma.event.update({
    where: { id: eventId },
    data: { status },
  });
}

export async function createRSVP(eventId: string, userId: string) {
  return prisma.rSVP.create({
    data: {
      eventId,
      userId,
    },
  });
}

export async function checkInAttendee(rsvpId: string) {
  return prisma.rSVP.update({
    where: { id: rsvpId },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
    },
  });
}

export async function createFeedback(data: {
  eventId: string;
  userId: string;
  comment?: string;
  reaction?: 'THUMBS_UP' | 'THUMBS_DOWN' | 'HEART' | 'SURPRISE';
}) {
  return prisma.feedback.create({
    data,
  });
}

export async function getEventAnalytics(eventId: string) {
  const [event, rsvps, feedback] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
    }),
    prisma.rSVP.count({
      where: { eventId },
    }),
    prisma.feedback.findMany({
      where: { eventId },
    }),
  ]);

  const checkedInCount = await prisma.rSVP.count({
    where: {
      eventId,
      checkedIn: true,
    },
  });

  const reactionCounts = feedback.reduce((acc: Record<Reaction, number>, curr: Feedback) => {
    if (curr.reaction) {
      acc[curr.reaction] = (acc[curr.reaction] || 0) + 1;
    }
    return acc;
  }, {} as Record<Reaction, number>);

  return {
    event,
    totalRSVPs: rsvps,
    checkedInCount,
    reactionCounts,
    feedback,
  };
} 