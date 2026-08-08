import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "FCM token is required." },
        { status: 400 },
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.fcmSubscriptions.deleteMany({
      where: { TokenHash: tokenHash },
    });

    return NextResponse.json({
      success: true,
      message: "Push notification subscription removed.",
    });
  } catch (error) {
    console.error("FCM unsubscribe error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove push subscription." },
      { status: 500 },
    );
  }
}
