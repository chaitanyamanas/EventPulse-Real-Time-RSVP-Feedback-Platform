import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        rsvps: true,
        feedback: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!event) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
