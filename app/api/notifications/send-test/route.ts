import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FcmSubscriptions_AppRole } from "@prisma/client";
import { sendPushNotification } from "@/services/PushNotificationService";
import { verifyAdminRequest } from "@/services/AuthService";

export async function POST(request: NextRequest) {
  try {
    const { payload } = await verifyAdminRequest(request);
    if (!payload.AdminLoginID) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const title = String(body.title ?? "RM Sounds");
    const message = String(body.body ?? "Test notification from RM Sounds.");

    const subscriptions = await prisma.fcmSubscriptions.findMany({
      where: { AppRole: FcmSubscriptions_AppRole.Admin },
      select: { FcmToken: true },
    });

    const result = await sendPushNotification({
      tokens: subscriptions.map((x) => x.FcmToken),
      title,
      body: message,
      data: { type: "test" },
      link: "/Dashboard",
    });

    if (result.invalidTokens.length) {
      await prisma.fcmSubscriptions.deleteMany({
        where: { FcmToken: { in: result.invalidTokens } },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("FCM test send error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send notification.",
      },
      { status: 500 },
    );
  }
}
