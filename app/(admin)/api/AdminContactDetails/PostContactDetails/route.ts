import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function extractGoogleMapSourceUrl(value: string): string {
  if (!value) return "";

  value = value.trim();

  if (value.startsWith("https://")) {
    return value;
  }

  const match = value.match(/src=["']([^"']+)["']/i);

  if (match && match[1]) {
    return match[1];
  }

  return value;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      LocationID,
      LocationManager,
      ContactNumber,
      ContactEmail,
      FullAddress,
      GoogleMapEmbedUrl,
      LocationType,
      CreatedBy,
      UpdatedBy,
    } = body;

    const locationId = Number(LocationID) || 0;

    const mapSourceUrl = extractGoogleMapSourceUrl(GoogleMapEmbedUrl || "");

    if (locationId === 0) {
      const location = await prisma.organizationLocations.create({
        data: {
          LocationManager,
          ContactNumber,
          ContactEmail,
          FullAddress,
          GoogleMapEmbedUrl: mapSourceUrl,
          LocationType,
          CreatedAt: new Date(),
          CreatedBy,
        },
        select: {
          LocationID: true,
          LocationManager: true,
          ContactNumber: true,
          ContactEmail: true,
          FullAddress: true,
          GoogleMapEmbedUrl: true,
          LocationType: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Location created successfully.",
        data: location,
      });
    }

    const existingLocation = await prisma.organizationLocations.findUnique({
      where: {
        LocationID: locationId,
      },
    });

    if (!existingLocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Location not found.",
        },
        {
          status: 404,
        },
      );
    }

    const location = await prisma.organizationLocations.update({
      where: {
        LocationID: locationId,
      },
      data: {
        LocationManager,
        ContactNumber,
        ContactEmail,
        FullAddress,
        GoogleMapEmbedUrl: mapSourceUrl,
        LocationType,
        UpdatedAt: new Date(),
        UpdatedBy,
      },
      select: {
        LocationID: true,
        LocationManager: true,
        ContactNumber: true,
        ContactEmail: true,
        FullAddress: true,
        GoogleMapEmbedUrl: true,
        LocationType: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Location updated successfully.",
      data: location,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save location.",
        error: String(error),
      },
      {
        status: 500,
      },
    );
  }
}
