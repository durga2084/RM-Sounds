import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const type = String(body.Type ?? "").trim();
    const value = String(body.Value ?? "").trim();

    if (type.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Search Type is required.",
        },
        { status: 400 },
      );
    }

    if (value.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Search Value is required.",
        },
        { status: 400 },
      );
    }

    let where = {};

    switch (type) {
      case "BookingID":
        if (isNaN(Number(value))) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid Booking ID.",
            },
            { status: 400 },
          );
        }

        where = {
          BookingID: Number(value),
        };
        break;

      case "BookingNo":
        where = {
          BookingNo: value,
        };
        break;

      case "MobileNumber":
        if (!/^[6-9]\d{9}$/.test(value)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid Mobile Number.",
            },
            { status: 400 },
          );
        }

        where = {
          MobileNumber: value,
        };
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid Search Type. Allowed values are BookingID, BookingNo or MobileNumber.",
          },
          { status: 400 },
        );
    }

    const bookings = await prisma.eventBookings.findMany({
      where,
      orderBy: {
        EventDate: "desc",
      },
    });

    if (bookings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No bookings found.",
        },
        { status: 404 },
      );
    }

    const eventTypeIds = [...new Set(bookings.map((x) => x.EventType))];

    const eventTypes = await prisma.eventTypes.findMany({
      where: {
        EventTypeID: {
          in: eventTypeIds,
        },
      },
      select: {
        EventTypeID: true,
        EventTypeName: true,
        EventShortKey: true,
      },
    });

    const eventMap = new Map(eventTypes.map((x) => [x.EventTypeID, x]));

    const data = bookings.map((booking) => ({
      ...booking,
      EventTypeName: eventMap.get(booking.EventType)?.EventTypeName ?? "",
      EventShortKey: eventMap.get(booking.EventType)?.EventShortKey ?? "",
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings.",
      },
      {
        status: 500,
      },
    );
  }
}
