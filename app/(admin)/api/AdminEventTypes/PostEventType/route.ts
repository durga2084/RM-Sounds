import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventTypes_Status } from "@prisma/client";

async function generateEventShortKey(
  eventTypeName: string,
  excludeEventTypeID?: number,
): Promise<string> {
  const cleanedName = eventTypeName
    .trim()
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, " ");

  const words = cleanedName.split(" ").filter(Boolean);

  let shortKey = "";

  if (words.length >= 3) {
    shortKey = words[0][0] + words[1][0] + words[2][0];
  } else if (words.length === 2) {
    shortKey = words[0].substring(0, 2) + words[1].substring(0, 1);
  } else {
    shortKey = words[0].substring(0, 3);
  }

  shortKey = shortKey.toUpperCase();

  let exists = await prisma.eventTypes.findFirst({
    where: {
      EventShortKey: shortKey,
      ...(excludeEventTypeID
        ? {
            NOT: {
              EventTypeID: excludeEventTypeID,
            },
          }
        : {}),
    },
  });

  if (!exists) {
    return shortKey;
  }

  const prefix = shortKey.substring(0, 2);

  for (let i = 1; i <= 9; i++) {
    const key = `${prefix}${i}`;

    exists = await prisma.eventTypes.findFirst({
      where: {
        EventShortKey: key,
        ...(excludeEventTypeID
          ? {
              NOT: {
                EventTypeID: excludeEventTypeID,
              },
            }
          : {}),
      },
    });

    if (!exists) {
      return key;
    }
  }

  throw new Error("Unable to generate a unique Event Short Key.");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { EventTypeID, EventTypeName, Status, CreatedBy, UpdatedBy } = body;

    const eventTypeId = Number(EventTypeID) || 0;

    const eventTypeName = String(EventTypeName ?? "").trim();

    if (eventTypeName.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Event Type Name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (eventTypeId === 0) {
      const duplicate = await prisma.eventTypes.findFirst({
        where: {
          EventTypeName: eventTypeName,
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Event Type already exists.",
          },
          {
            status: 409,
          },
        );
      }

      const shortKey = await generateEventShortKey(eventTypeName);

      const status: EventTypes_Status =
        body.Status === "Inactive"
          ? EventTypes_Status.Inactive
          : EventTypes_Status.Active;

      const eventType = await prisma.eventTypes.create({
        data: {
          EventTypeName: eventTypeName,
          EventShortKey: shortKey,
          Status: status,
          CreatedAt: new Date(),
          CreatedBy,
        },
        select: {
          EventTypeID: true,
          EventTypeName: true,
          EventShortKey: true,
          Status: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Event Type created successfully.",
        data: eventType,
      });
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
        {
          status: 404,
        },
      );
    }

    const duplicate = await prisma.eventTypes.findFirst({
      where: {
        EventTypeName: eventTypeName,
        NOT: {
          EventTypeID: eventTypeId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Event Type already exists.",
        },
        {
          status: 409,
        },
      );
    }

    let shortKey = existing.EventShortKey;

    if (
      existing.EventTypeName.trim().toLowerCase() !==
      eventTypeName.toLowerCase()
    ) {
      shortKey = await generateEventShortKey(eventTypeName, eventTypeId);
    }

    const updated = await prisma.eventTypes.update({
      where: {
        EventTypeID: eventTypeId,
      },
      data: {
        EventTypeName: eventTypeName,
        EventShortKey: shortKey,
        Status,
        UpdatedAt: new Date(),
        UpdatedBy,
      },
      select: {
        EventTypeID: true,
        EventTypeName: true,
        EventShortKey: true,
        Status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event Type updated successfully.",
      data: updated,
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to save Event Type.",
      },
      {
        status: 500,
      },
    );
  }
}
