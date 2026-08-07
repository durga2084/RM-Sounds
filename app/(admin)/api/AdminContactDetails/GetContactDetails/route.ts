import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      PageNumber = 1,
      PageSize = 10,
      SearchText = "",
      SortColumn = "LocationID",
      SortOrder = "DESC",
    } = body;

    const searchableColumns = [
      "LocationManager",
      "ContactNumber",
      "ContactEmail",
      "FullAddress",
      "GoogleMapEmbedUrl",
      "LocationType",
      "CreatedBy",
      "UpdatedBy",
    ] as const;

    const sortableColumns = [
      "LocationID",
      "LocationManager",
      "ContactNumber",
      "ContactEmail",
      "LocationType",
      "CreatedAt",
      "UpdatedAt",
    ] as const;

    const page = Math.max(Number(PageNumber), 1);
    const pageSize = Math.max(Number(PageSize), 1);
    const skip = (page - 1) * pageSize;

    const whereCondition =
      SearchText.trim() === ""
        ? {}
        : {
            OR: searchableColumns.map((column) => ({
              [column]: {
                contains: SearchText,
              },
            })),
          };

    const orderColumn = sortableColumns.includes(
      SortColumn as (typeof sortableColumns)[number],
    )
      ? SortColumn
      : "LocationID";

    const orderDirection =
      String(SortOrder).toUpperCase() === "ASC" ? "asc" : "desc";

    const totalRecords = await prisma.organizationLocations.count({
      where: whereCondition,
    });

    const locations = await prisma.organizationLocations.findMany({
      where: whereCondition,

      select: {
        LocationID: true,
        LocationManager: true,
        ContactNumber: true,
        ContactEmail: true,
        FullAddress: true,
        GoogleMapEmbedUrl: true,
        LocationType: true,
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

      data: locations,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown server error.",
      },
      {
        status: 500,
      },
    );
  }
}
