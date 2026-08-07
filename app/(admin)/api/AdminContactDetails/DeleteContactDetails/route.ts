import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const locationId = Number(body.LocationID);

    if (!Number.isInteger(locationId) || locationId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid LocationID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const existingLocation = await prisma.organizationLocations.findUnique({
      where: {
        LocationID: locationId,
      },
      select: {
        LocationID: true,
      },
    });

    if (!existingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Location record not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.organizationLocations.delete({
      where: {
        LocationID: locationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully.",
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete location.",
      },
      {
        status: 500,
      },
    );
  }
}
