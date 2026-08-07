import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventCalendar_BookingAvailability, Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      PageNumber = 1,
      PageSize = 10,
      UpcomingDays = null,
      FromDate = null,
      ToDate = null,
      Status = null,
      SortColumn = "EventDate",
      SortOrder = "ASC",
    } = body;

    const page = Math.max(Number(PageNumber), 1);
    const pageSize = Math.max(Number(PageSize), 1);
    const skip = (page - 1) * pageSize;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date | null = null;

    if (UpcomingDays && Number(UpcomingDays) > 0) {
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + Number(UpcomingDays) - 1);
    } else {
      if (FromDate) {
        startDate = new Date(FromDate);
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate = new Date(today);
      }

      if (ToDate) {
        endDate = new Date(ToDate);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format provided." },
        { status: 400 },
      );
    }

    if (endDate && isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format provided." },
        { status: 400 },
      );
    }

    const dateFilter: Prisma.DateTimeFilter = {
      gte: startDate,
    };
    if (endDate) {
      dateFilter.lte = endDate;
    }

    const where: Prisma.EventCalendarWhereInput = {
      EventDate: dateFilter,
    };

    if (Status) {
      const allowedStatus: EventCalendar_BookingAvailability[] = [
        EventCalendar_BookingAvailability.Available,
        EventCalendar_BookingAvailability.PartiallyBooked,
        EventCalendar_BookingAvailability.FullyBooked,
      ];

      if (
        !allowedStatus.includes(Status as EventCalendar_BookingAvailability)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid status. Allowed: Available, PartiallyBooked, FullyBooked.",
          },
          { status: 400 },
        );
      }
      where.BookingAvailability = Status as EventCalendar_BookingAvailability;
    }

    const sortableColumns = [
      "EventDate",
      "BookingAvailability",
      "CreatedAt",
      "UpdatedAt",
    ] as const;

    const orderColumn = sortableColumns.includes(
      SortColumn as (typeof sortableColumns)[number],
    )
      ? SortColumn
      : "EventDate";

    const orderDirection =
      String(SortOrder).toUpperCase() === "DESC" ? "desc" : "asc";

    const totalRecords = await prisma.eventCalendar.count({ where });

    const records = await prisma.eventCalendar.findMany({
      where,
      orderBy: {
        [orderColumn]: orderDirection,
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      currentPage: page,
      pageSize,
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
      hasPreviousPage: page > 1,
      hasNextPage: page < Math.ceil(totalRecords / pageSize),
      dateRange: {
        from: startDate.toISOString().split("T")[0],
        to: endDate ? endDate.toISOString().split("T")[0] : "Ongoing",
      },
      filters: {
        status: Status || "All",
        upcomingDays: UpcomingDays || null,
      },
      data: records,
    });
  } catch (error) {
    console.error("GetCalendar Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch calendar data.",
      },
      { status: 500 },
    );
  }
}
