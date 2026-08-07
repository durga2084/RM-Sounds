import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventCalendar_BookingAvailability } from "@prisma/client";

function getISTNow(): Date {
  const now = new Date();
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + IST_OFFSET_MS);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const calendarID = Number(body.CalendarID ?? 0);
    const startDate = String(body.StartDate ?? "").trim();
    const endDate = String(body.EndDate ?? "").trim();
    const bookingAvailability = String(body.BookingAvailability ?? "").trim() as EventCalendar_BookingAvailability;
    const remarks = body.Remarks && String(body.Remarks).trim().length > 0
      ? String(body.Remarks).trim()
      : null;
    const user = String(body.User ?? "Admin").trim();

    const allowedStatus: EventCalendar_BookingAvailability[] = [
      EventCalendar_BookingAvailability.Available,
      EventCalendar_BookingAvailability.PartiallyBooked,
      EventCalendar_BookingAvailability.FullyBooked,
    ];

    if (!allowedStatus.includes(bookingAvailability)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Booking Availability. Allowed values are Available, PartiallyBooked, FullyBooked.",
        },
        { status: 400 }
      );
    }

    if (calendarID > 0) {
      const calendar = await prisma.eventCalendar.findUnique({
        where: { CalendarID: calendarID },
      });

      if (!calendar) {
        return NextResponse.json(
          { success: false, message: "Calendar record not found." },
          { status: 404 }
        );
      }

      const updated = await prisma.eventCalendar.update({
        where: { CalendarID: calendarID },
        data: {
          BookingAvailability: bookingAvailability,
          Remarks: remarks,
          UpdatedAt: getISTNow(),
          UpdatedBy: user,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Calendar updated successfully.",
        data: updated,
      });
    }

    if (startDate.length === 0) {
      return NextResponse.json(
        { success: false, message: "Start Date is required." },
        { status: 400 }
      );
    }
    if (endDate.length === 0) {
      return NextResponse.json(
        { success: false, message: "End Date is required." },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format." },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { success: false, message: "Start Date cannot be greater than End Date." },
        { status: 400 }
      );
    }

    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const existingDates = await prisma.eventCalendar.findMany({
      where: {
        EventDate: {
          gte: start,
          lte: end,
        },
      },
      select: { EventDate: true },
    });

    if (existingDates.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more selected dates already exist.",
          duplicateDates: existingDates.map((item) => item.EventDate),
        },
        { status: 409 }
      );
    }

    const createdRecords = await prisma.$transaction(
      dates.map((date) =>
        prisma.eventCalendar.create({
          data: {
            EventDate: date,
            BookingAvailability: bookingAvailability,
            Remarks: remarks,
            CreatedAt: getISTNow(),
            CreatedBy: user,
          },
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        message: "Calendar created successfully.",
        totalDays: createdRecords.length,
        data: createdRecords,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PostEventInCalender Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save calendar." },
      { status: 500 }
    );
  }
}