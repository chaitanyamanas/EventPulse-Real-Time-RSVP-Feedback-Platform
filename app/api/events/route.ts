import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("hostId");
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: {
        hostId: hostId || session.user.id,
      },
      include: {
        rsvps: true,
      },
      orderBy: {
        dateTime: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const event = await prisma.event.create({
      data: {
        ...body,
        hostId: session.user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
