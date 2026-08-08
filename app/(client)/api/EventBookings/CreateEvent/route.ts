import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  EventBookings_Status,
  EventTypes_Status,
  FcmSubscriptions_AppRole,
} from "@prisma/client";
import { sendPushNotification } from "@/services/PushNotificationService";

function generateRandomDigits(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateBookingNo(eventShortKey: string): string {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `RM${day}${hours}${minutes}${eventShortKey}${generateRandomDigits()}`;
}

async function generateUniqueBookingNo(eventShortKey: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const bookingNo = generateBookingNo(eventShortKey);

    const exists = await prisma.eventBookings.findUnique({
      where: {
        BookingNo: bookingNo,
      },
      select: {
        BookingID: true,
      },
    });

    if (!exists) {
      return bookingNo;
    }
  }

  throw new Error("Unable to generate a unique Booking Number.");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customerName = String(body.CustomerName ?? "").trim();
    const mobileNumber = String(body.MobileNumber ?? "").trim();
    const eventTypeId = Number(body.EventType) || 0;
    const eventLocation = String(body.EventLocation ?? "").trim();
    const notes = String(body.Notes ?? "").trim();

    if (customerName.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer Name is required.",
        },
        { status: 400 },
      );
    }

    if (customerName.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer Name cannot exceed 50 characters.",
        },
        { status: 400 },
      );
    }

    if (mobileNumber.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile Number is required.",
        },
        { status: 400 },
      );
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10-digit Mobile Number.",
        },
        { status: 400 },
      );
    }

    if (eventTypeId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select an Event Type.",
        },
        { status: 400 },
      );
    }

    if (!body.EventDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Event Date is required.",
        },
        { status: 400 },
      );
    }

    if (!body.EventEndDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Event End Date is required.",
        },
        { status: 400 },
      );
    }

    if (eventLocation.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Event Location is required.",
        },
        { status: 400 },
      );
    }

    const startDate = new Date(String(body.EventDate).trim());
    const endDate = new Date(String(body.EventEndDate).trim());

    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Event Date.",
        },
        { status: 400 },
      );
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Event End Date.",
        },
        { status: 400 },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Event Date cannot be in the past.",
        },
        { status: 400 },
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Event End Date cannot be earlier than Event Date.",
        },
        { status: 400 },
      );
    }

    const eventType = await prisma.eventTypes.findUnique({
      where: {
        EventTypeID: eventTypeId,
      },
      select: {
        EventTypeID: true,
        EventTypeName: true,
        EventShortKey: true,
        Status: true,
      },
    });

    if (!eventType) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected Event Type not found.",
        },
        { status: 404 },
      );
    }

    if (eventType.Status !== EventTypes_Status.Active) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected Event Type is inactive.",
        },
        { status: 400 },
      );
    }

    const bookingNo = await generateUniqueBookingNo(eventType.EventShortKey);

    const booking = await prisma.eventBookings.create({
      data: {
        BookingNo: bookingNo,
        CustomerName: customerName,
        MobileNumber: mobileNumber,
        EventType: eventType.EventTypeID,
        EventDate: startDate,
        EventEndDate: endDate,
        EventLocation: eventLocation,
        Notes: notes,
        BookingStatus: EventBookings_Status.Pending,
        CreatedAt: new Date(),
        CreatedBy: "Client",
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
      },
    });

    try {
      const customerSubscriptions = await prisma.fcmSubscriptions.findMany({
        where: {
          AppRole: FcmSubscriptions_AppRole.Customer,
          CustomerMobile: mobileNumber,
        },
        select: { FcmToken: true },
      });

      await sendPushNotification({
        tokens: customerSubscriptions.map((s) => s.FcmToken),
        title: "Booking received",
        body: `Your ${eventType.EventTypeName} booking request has been received. Booking No: ${booking.BookingNo}.`,
        link: "/Calendar?tab=my-bookings",
        data: {
          bookingId: String(booking.BookingID),
          bookingNo: booking.BookingNo,
          status: booking.BookingStatus,
          audience: "customer",
        },
      });
    } catch (notificationError) {
      console.error("Customer booking notification error:", notificationError);
    }

    try {
      const adminSubscriptions = await prisma.fcmSubscriptions.findMany({
        where: { AppRole: FcmSubscriptions_AppRole.Admin },
        select: { FcmToken: true },
      });

      await sendPushNotification({
        tokens: adminSubscriptions.map((s) => s.FcmToken),
        title: "New booking request",
        body: `${customerName} requested ${eventType.EventTypeName} (${booking.BookingNo}).`,
        link: "/Dashboard?tab=bookings",
        data: {
          bookingId: String(booking.BookingID),
          bookingNo: booking.BookingNo,
          status: booking.BookingStatus,
          audience: "admin",
        },
      });
    } catch (notificationError) {
      console.error("Admin notification error:", notificationError);
    }

    return NextResponse.json(
      {
        success: true,
         message: `Your requested booking for ${eventType.EventTypeName} has been created successfully with Booking Number ${bookingNo}.`,
        data: {
          ...booking,
          EventTypeName: eventType.EventTypeName,
          EventShortKey: eventType.EventShortKey,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error("Create Booking Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create booking.",
      },
      {
        status: 500,
      },
    );
  }
}
