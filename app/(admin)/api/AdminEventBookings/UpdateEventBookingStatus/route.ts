import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  EventBookings_Status,
  EventCalendar_BookingAvailability,
} from "@prisma/client";

function normalizeStatus(status: string): EventBookings_Status | null {
  const value = status.trim().toLowerCase();

  switch (value) {
    case "approved":
    case "accept":
    case "accepted":
      return EventBookings_Status.Accepted;
    case "rejected":
    case "reject":
      return EventBookings_Status.Rejected;
    case "pending":
      return EventBookings_Status.Pending;
    case "cancelled":
    case "canceled":
      return EventBookings_Status.Cancelled;
    case "completed":
      return EventBookings_Status.Completed;
    default:
      return null;
  }
}

function normalizeAvailability(
  availability: string,
): EventCalendar_BookingAvailability | null {
  const value = availability.trim().toLowerCase();
  switch (value) {
    case "fullybooked":
      return EventCalendar_BookingAvailability.FullyBooked;
    case "partiallybooked":
      return EventCalendar_BookingAvailability.PartiallyBooked;
    case "available":
      return EventCalendar_BookingAvailability.Available;
    default:
      return null;
  }
}

function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  const last = new Date(endDate);

  current.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bookingId = Number(body.BookingID);
    const statusInput = String(body.Status ?? "").trim();
    const updatedBy = String(body.UpdatedBy ?? "Admin").trim() || "Admin";
    const availabilityInput = body.BookingAvailability as string | undefined;

    if (!bookingId || Number.isNaN(bookingId)) {
      return NextResponse.json(
        { success: false, message: "Valid BookingID is required." },
        { status: 400 },
      );
    }

    const normalizedStatus = normalizeStatus(statusInput);
    if (!normalizedStatus) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Use Approved/Rejected/Pending/Cancelled/Completed.",
        },
        { status: 400 },
      );
    }

    const existingBooking = await prisma.eventBookings.findUnique({
      where: { BookingID: bookingId },
      select: {
        BookingID: true,
        BookingNo: true,
        EventType: true,
        EventDate: true,
        EventEndDate: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: "Booking request not found." },
        { status: 404 },
      );
    }

    if (normalizedStatus === EventBookings_Status.Accepted) {
      let calendarAvailability: EventCalendar_BookingAvailability =
        EventCalendar_BookingAvailability.FullyBooked;

      if (availabilityInput) {
        const normalizedAvail = normalizeAvailability(availabilityInput);
        if (!normalizedAvail) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid BookingAvailability. Allowed: FullyBooked, PartiallyBooked.",
            },
            { status: 400 },
          );
        }
        calendarAvailability = normalizedAvail;
      }

      const dateRange = getDateRange(
        existingBooking.EventDate,
        existingBooking.EventEndDate,
      );

      for (const calendarDate of dateRange) {
        const existingCalendarEntry = await prisma.eventCalendar.findFirst({
          where: { EventDate: calendarDate },
        });

        if (existingCalendarEntry) {
          await prisma.eventCalendar.update({
            where: { CalendarID: existingCalendarEntry.CalendarID },
            data: {
              BookingAvailability: calendarAvailability,
              Remarks: existingCalendarEntry.Remarks
                ? `${existingCalendarEntry.Remarks} | Booking ${existingBooking.BookingNo}`
                : `Booking ${existingBooking.BookingNo}`,
              UpdatedAt: new Date(),
              UpdatedBy: updatedBy,
            },
          });
        } else {
          await prisma.eventCalendar.create({
            data: {
              EventDate: calendarDate,
              BookingAvailability: calendarAvailability,
              Remarks: `Booking ${existingBooking.BookingNo}`,
              CreatedAt: new Date(),
              CreatedBy: updatedBy,
            },
          });
        }
      }
    }

    const updatedBooking = await prisma.eventBookings.update({
      where: { BookingID: bookingId },
      data: {
        BookingStatus: normalizedStatus,
        UpdatedAt: new Date(),
        UpdatedBy: updatedBy,
      },
      select: {
        BookingID: true,
        BookingNo: true,
        CustomerName: true,
        MobileNumber: true,
        EventType: true,
        EventDate: true,
        EventEndDate: true,
        EventLocation: true,
        Notes: true,
        BookingStatus: true,
        CreatedAt: true,
        CreatedBy: true,
        UpdatedAt: true,
        UpdatedBy: true,
      },
    });

    const eventType = await prisma.eventTypes.findUnique({
      where: { EventTypeID: updatedBooking.EventType },
      select: {
        EventTypeID: true,
        EventTypeName: true,
        EventShortKey: true,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        normalizedStatus === EventBookings_Status.Accepted
          ? "Booking request approved successfully."
          : "Booking request rejected successfully.",
      data: {
        ...updatedBooking,
        EventTypeName: eventType?.EventTypeName ?? "",
        EventShortKey: eventType?.EventShortKey ?? "",
      },
    });
  } catch (error) {
    console.error("Update Admin Booking Status Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking status.",
      },
      { status: 500 },
    );
  }
}
