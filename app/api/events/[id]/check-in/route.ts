import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

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

    await prisma.rsvp.update({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
      data: {
        checkedIn: true,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error checking in:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
