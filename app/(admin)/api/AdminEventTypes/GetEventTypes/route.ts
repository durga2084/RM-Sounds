import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      PageNumber = 1,
      PageSize = 10,
      SearchText = "",
      SortColumn = "EventTypeID",
      SortOrder = "DESC",
      Status = "",
    } = body;

    const page = Math.max(Number(PageNumber), 1);
    const pageSize = Math.max(Number(PageSize), 1);

    const skip = (page - 1) * pageSize;

    const sortableColumns = [
      "EventTypeID",
      "EventTypeName",
      "EventShortKey",
      "Status",
      "CreatedAt",
      "UpdatedAt",
    ] as const;

    const orderColumn = sortableColumns.includes(
      SortColumn as (typeof sortableColumns)[number],
    )
      ? SortColumn
      : "EventTypeID";

    const orderDirection =
      String(SortOrder).toUpperCase() === "ASC" ? "asc" : "desc";

    const whereCondition = {
      ...(SearchText
        ? {
            OR: [
              {
                EventTypeName: {
                  contains: SearchText,
                },
              },
              {
                EventShortKey: {
                  contains: SearchText,
                },
              },
            ],
          }
        : {}),

      ...(Status
        ? {
            Status,
          }
        : {}),
    };

    const totalRecords = await prisma.eventTypes.count({
      where: whereCondition,
    });

    const eventTypes = await prisma.eventTypes.findMany({
      where: whereCondition,

      select: {
        EventTypeID: true,
        EventTypeName: true,
        EventShortKey: true,
        Status: true,
        CreatedAt: true,
        CreatedBy: true,
        UpdatedAt: true,
        UpdatedBy: true,
      },

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

      data: eventTypes,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Event Types.",
      },
      {
        status: 500,
      },
    );
  }
}
