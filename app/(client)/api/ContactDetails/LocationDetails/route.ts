import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.organizationLocations.findMany({
      select: {
        LocationID: true,
        LocationManager: true,
        ContactNumber: true,
        ContactEmail: true,
        FullAddress: true,
        GoogleMapEmbedUrl: true,
        LocationType: true,
      },
      orderBy: {
        LocationID: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch organization locations.",
      },
      {
        status: 500,
      },
    );
  }
}
