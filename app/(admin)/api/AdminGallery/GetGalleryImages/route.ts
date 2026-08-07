import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      PageNumber = 1,
      PageSize = 1000,
      SortColumn = "GalleryImageID",
      SortOrder = "DESC",
    } = body;

    const page = Math.max(Number(PageNumber), 1);
    const pageSize = Math.max(Number(PageSize), 1);

    const skip = (page - 1) * pageSize;

    const sortableColumns = [
      "GalleryImageID",
      "CreatedAt",
      "CreatedBy",
    ] as const;

    const orderColumn = sortableColumns.includes(
      SortColumn as (typeof sortableColumns)[number],
    )
      ? SortColumn
      : "GalleryImageID";

    const orderDirection =
      String(SortOrder).toUpperCase() === "ASC" ? "asc" : "desc";

    const totalRecords = await prisma.websiteGallery.count();

    const galleryImages = await prisma.websiteGallery.findMany({
      select: {
        GalleryImageID: true,
        ImageFileName: true,
        ImageUrl: true,
        CreatedAt: true,
        CreatedBy: true,
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

      data: galleryImages,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch gallery images.",
      },
      {
        status: 500,
      },
    );
  }
}
