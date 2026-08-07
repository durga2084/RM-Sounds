// D:\RM-Sounds\app\(client)\api\EventBookings\ViewCalendarEvents\route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventCalendar_BookingAvailability } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Read raw body as text to avoid JSON parse errors
    const rawBody = await request.text();
    console.log("📦 Raw body received:", rawBody); // debug – remove after testing

    // 2️⃣ If body is empty, return a clear 400 error
    if (!rawBody) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body is empty. Please send a valid JSON payload.",
        },
        { status: 400 },
      );
    }

    // 3️⃣ Parse JSON safely – catch and log the error
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("❌ Invalid JSON:", rawBody, parseError); // ✅ now using the error
      return NextResponse.json(
        { success: false, message: "Invalid JSON format in request body." },
        { status: 400 },
      );
    }

    const { Month, Year } = body;

    // 4️⃣ Validate Month and Year
    if (Month === undefined || Year === undefined) {
      return NextResponse.json(
        { success: false, message: "Month and Year are required." },
        { status: 400 },
      );
    }

    const month = parseInt(Month, 10);
    const year = parseInt(Year, 10);

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2000) {
      return NextResponse.json(
        { success: false, message: "Invalid Month (1-12) or Year (>=2000)." },
        { status: 400 },
      );
    }

    // 5️⃣ Query the database
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const records = await prisma.eventCalendar.findMany({
      where: {
        EventDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        EventDate: true,
        BookingAvailability: true,
      },
    });

    // Build status map
    const statusMap = new Map<string, EventCalendar_BookingAvailability>();
    for (const record of records) {
      const dateStr = record.EventDate.toISOString().split("T")[0];
      statusMap.set(dateStr, record.BookingAvailability);
    }

    // Build full month data
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      const dateStr = dateObj.toISOString().split("T")[0];
      const status =
        statusMap.get(dateStr) || EventCalendar_BookingAvailability.Available;
      result.push({ date: dateStr, status });
    }

    return NextResponse.json({
      success: true,
      month,
      year,
      totalDays: daysInMonth,
      data: result,
    });
  } catch (error) {
    console.error("❌ Client Calendar API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch calendar data." },
      { status: 500 },
    );
  }
}
