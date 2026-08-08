import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { FcmSubscriptions_AppRole } from "@prisma/client";
import { verifyAdminRequest } from "@/services/AuthService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = String(body.token ?? "").trim();
    const roleInput = String(body.role ?? "Customer")
      .trim()
      .toLowerCase();

    const customerMobile = String(body.customerMobile ?? "").trim();

    const role =
      roleInput === "admin"
        ? FcmSubscriptions_AppRole.Admin
        : FcmSubscriptions_AppRole.Customer;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "FCM token is required.",
        },
        {
          status: 400,
        },
      );
    }

    let adminLoginID: number | undefined;

    if (role === FcmSubscriptions_AppRole.Admin) {
      const { payload } = await verifyAdminRequest(request);

      const parsedAdminLoginID = Number(payload.AdminLoginID);

      if (!parsedAdminLoginID || Number.isNaN(parsedAdminLoginID)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid admin session.",
          },
          {
            status: 401,
          },
        );
      }

      adminLoginID = parsedAdminLoginID;
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const userAgent = request.headers.get("user-agent") ?? "";

    const existingSubscription = await prisma.fcmSubscriptions.findFirst({
      where: {
        TokenHash: tokenHash,
      },
      select: {
        SubscriptionID: true,
      },
    });

    if (existingSubscription) {
      await prisma.fcmSubscriptions.update({
        where: {
          SubscriptionID: existingSubscription.SubscriptionID,
        },
        data: {
          FcmToken: token,
          AppRole: role,

          CustomerMobile:
            role === FcmSubscriptions_AppRole.Customer && customerMobile
              ? customerMobile
              : null,

          AdminLoginID:
            role === FcmSubscriptions_AppRole.Admin
              ? (adminLoginID ?? null)
              : null,

          UserAgent: userAgent,
        },
      });
    } else {
      await prisma.fcmSubscriptions.create({
        data: {
          TokenHash: tokenHash,
          FcmToken: token,
          AppRole: role,

          CustomerMobile:
            role === FcmSubscriptions_AppRole.Customer && customerMobile
              ? customerMobile
              : null,

          AdminLoginID:
            role === FcmSubscriptions_AppRole.Admin
              ? (adminLoginID ?? null)
              : null,

          UserAgent: userAgent,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Push notification subscription saved.",
    });
  } catch (error) {
    console.error("FCM subscribe error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to save push subscription.",
      },
      {
        status: 500,
      },
    );
  }
}
