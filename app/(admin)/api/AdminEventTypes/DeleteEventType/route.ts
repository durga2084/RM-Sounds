import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const eventTypeId = Number(body.EventTypeID);

    if (!eventTypeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid EventTypeID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const existing = await prisma.eventTypes.findUnique({
      where: {
        EventTypeID: eventTypeId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Event Type not found.",
        },
        {
          status: 404,
        },
      );
    }

    const bookingExists = await prisma.eventBookings.findFirst({
      where: {
        EventType: existing.EventTypeID,
      },
    });

    if (bookingExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Event Type is already used in bookings.",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.eventTypes.delete({
      where: {
        EventTypeID: eventTypeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event Type deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete Event Type.",
      },
      {
        status: 500,
      },
    );
  }
}
