import { NextRequest, NextResponse } from "next/server";
import { sendEventReminders } from "@/services/EventReminderService";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  return request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const result = await sendEventReminders(1);

    return NextResponse.json(
      {
        success: true,
        message: "Send1DayEventReminders executed successfully.",
        data: result,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Send1DayEventReminders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to execute reminder cron.",
      },
      {
        status: 500,
      },
    );
  }
}
