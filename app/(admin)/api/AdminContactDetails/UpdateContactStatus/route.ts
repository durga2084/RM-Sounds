import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const locationId = Number(body.LocationID);
    const status = String(body.Status || "Active");

    if (!locationId) {
      return NextResponse.json({ success: false, message: "Valid LocationID is required." }, { status: 400 });
    }

    const existing = await prisma.organizationLocations.findUnique({ where: { LocationID: locationId } });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Location not found." }, { status: 404 });
    }

    const updated = await prisma.organizationLocations.update({
      where: { LocationID: locationId },
      data: { Status: status === "Inactive" ? "Inactive" : "Active", UpdatedAt: new Date(), UpdatedBy: body.UpdatedBy || null },
      select: { LocationID: true, LocationManager: true, LocationType: true, Status: true },
    });

    return NextResponse.json({ success: true, message: "Status updated.", data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to update status." }, { status: 500 });
  }
}
