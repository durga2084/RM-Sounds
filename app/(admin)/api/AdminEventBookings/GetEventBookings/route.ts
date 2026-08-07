import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventBookings_Status, Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const page = Math.max(Number(body.PageNumber ?? 1), 1);
    const pageSize = Math.max(Number(body.PageSize ?? 10), 1);
    const skip = (page - 1) * pageSize;

    const searchText = String(body.SearchText ?? "").trim();
    const statusFilter = String(body.Status ?? "").trim();
    const eventDateFilter = String(body.EventDate ?? "").trim();
    const fromDate = String(body.FromDate ?? "").trim();
    const toDate = String(body.ToDate ?? "").trim();
    const sortColumn = String(body.SortColumn ?? "CreatedAt").trim();
    const sortOrder =
      String(body.SortOrder ?? "DESC").toUpperCase() === "ASC" ? "asc" : "desc";

    const sortableColumns = [
      "BookingID",
      "BookingNo",
      "CustomerName",
      "MobileNumber",
      "EventDate",
      "EventEndDate",
      "BookingStatus",
      "CreatedAt",
    ] as const;

    const orderColumn = sortableColumns.includes(
      sortColumn as (typeof sortableColumns)[number],
    )
      ? sortColumn
      : "CreatedAt";

    const dateConditions: Prisma.EventBookingsWhereInput = {};

    if (eventDateFilter) {
      const filterDate = new Date(eventDateFilter);
      if (!isNaN(filterDate.getTime())) {
        const nextDay = new Date(filterDate);
        nextDay.setDate(nextDay.getDate() + 1);

        dateConditions.EventDate = {
          gte: filterDate,
          lt: nextDay,
        };
      }
    }

    if (fromDate) {
      const from = new Date(fromDate);
      if (!isNaN(from.getTime())) {
        dateConditions.EventDate = {
          ...(dateConditions.EventDate as Prisma.DateTimeFilter),
          gte: from,
        };
      }
    }

    if (toDate) {
      const to = new Date(toDate);
      if (!isNaN(to.getTime())) {
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        dateConditions.EventDate = {
          ...(dateConditions.EventDate as Prisma.DateTimeFilter),
          lte: endOfDay,
        };
      }
    }

    const whereCondition = {
      ...(searchText
        ? {
            OR: [
              {
                BookingNo: {
                  contains: searchText,
                },
              },
              {
                CustomerName: {
                  contains: searchText,
                },
              },
              {
                MobileNumber: {
                  contains: searchText,
                },
              },
              {
                EventLocation: {
                  contains: searchText,
                },
              },
            ],
          }
        : {}),
      ...(statusFilter
        ? {
            BookingStatus: statusFilter as EventBookings_Status,
          }
        : {}),
      ...dateConditions,
    };

    const [totalRecords, bookings] = await Promise.all([
      prisma.eventBookings.count({
        where: whereCondition,
      }),
      prisma.eventBookings.findMany({
        where: whereCondition,
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
        orderBy: {
          [orderColumn]: sortOrder,
        },
        skip,
        take: pageSize,
      }),
    ]);

    const eventTypeIds = [...new Set(bookings.map((booking) => booking.EventType))];

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

    const eventTypeMap = new Map(
      eventTypes.map((eventType) => [eventType.EventTypeID, eventType]),
    );

    const data = bookings.map((booking) => ({
      ...booking,
      EventTypeName: eventTypeMap.get(booking.EventType)?.EventTypeName ?? "",
      EventShortKey: eventTypeMap.get(booking.EventType)?.EventShortKey ?? "",
    }));

    return NextResponse.json({
      success: true,
      currentPage: page,
      pageSize,
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
      hasPreviousPage: page > 1,
      hasNextPage: page < Math.ceil(totalRecords / pageSize),
      data,
    });
  } catch (error) {
    console.error("Fetch Admin Bookings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch booking requests.",
      },
      {
        status: 500,
      },
    );
  }
}
