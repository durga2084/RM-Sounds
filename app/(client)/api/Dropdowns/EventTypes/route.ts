import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventTypes_Status } from "@prisma/client";

export async function POST() {
  try {
    const eventTypes = await prisma.eventTypes.findMany({
      where: {
        Status: EventTypes_Status.Active,
      },
      select: {
        EventTypeID: true,
        EventTypeName: true,
        EventShortKey: true,
      },
      orderBy: {
        EventTypeName: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: eventTypes,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch event types.",
      },
      {
        status: 500,
      },
    );
  }
}