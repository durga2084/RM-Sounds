import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const customerMobile = String(body.customerMobile ?? "").trim();

    if (!token || !/^[6-9]\d{9}$/.test(customerMobile)) {
      return NextResponse.json(
        { success: false, message: "Valid token and customer mobile are required." },
        { status: 400 },
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.fcmSubscriptions.updateMany({
      where: { TokenHash: tokenHash },
      data: { CustomerMobile: customerMobile },
    });

    return NextResponse.json({
      success: true,
      message: "Push subscription linked to customer.",
    });
  } catch (error) {
    console.error("FCM identify error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to link push subscription." },
      { status: 500 },
    );
  }
}
