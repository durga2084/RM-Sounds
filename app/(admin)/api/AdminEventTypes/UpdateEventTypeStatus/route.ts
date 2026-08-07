import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventTypes_Status } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const eventTypeId = Number(body.EventTypeID);

    if (!eventTypeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid EventTypeID is required.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.eventTypes.findUnique({
      where: {
        EventTypeID: eventTypeId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Event Type not found.",
        },
        { status: 404 },
      );
    }

    const status: EventTypes_Status =
      body.Status === "Inactive"
        ? EventTypes_Status.Inactive
        : EventTypes_Status.Active;

    const updated = await prisma.eventTypes.update({
      where: {
        EventTypeID: eventTypeId,
      },
      data: {
        Status: status,
        UpdatedAt: new Date(),
        UpdatedBy: body.UpdatedBy,
      },
      select: {
        EventTypeID: true,
        EventTypeName: true,
        Status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update status.",
      },
      {
        status: 500,
      },
    );
  }
}
