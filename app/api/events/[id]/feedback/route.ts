import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        eventId: params.id,
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

export async function POST(
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
    });

    if (!event) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (event.status !== "LIVE") {
      return new NextResponse("Event not live", { status: 400 });
    }

    const rsvp = await prisma.rsvp.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    });

    if (!rsvp) {
      return new NextResponse("Not RSVPed", { status: 400 });
    }

    const data = await request.json();

    if (!data.rating || !data.comment) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    });

    if (existingFeedback) {
      return new NextResponse("Feedback already exists", { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        eventId: params.id,
        userId: session.user.id,
        rating: data.rating,
        comment: data.comment,
      },
    });

    return new NextResponse(JSON.stringify(feedback), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in feedback route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { feedbackId, action } = body;

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (event.hostId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (feedback.eventId !== params.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        pinned: action === "pin",
        flagged: action === "flag",
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
