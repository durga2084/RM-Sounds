import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "@/services/SimpleJwt";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token is required.",
        },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token.",
        },
        { status: 401 },
      );
    }

    const jwtSecret =
      process.env.JWT_SECRET || "hkhjjkg23423RM338soundseuitioerutiore";

    const payload = await verify(token, jwtSecret);

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 401 },
      );
    }

    const session = await prisma.adminSessions.findFirst({
      where: {
        Token: token,
        IsActive: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found.",
        },
        { status: 404 },
      );
    }

    await prisma.adminSessions.update({
      where: {
        SessionID: session.SessionID,
      },
      data: {
        IsActive: false,
      },
    });

    await prisma.adminLogTimings.create({
      data: {
        UserName: payload.AdminUsername,
        LogStatus: "Logout",
        LogoutAt: new Date(),
        CreatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    console.error("Logout API Error:", message);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed.",
        error: message,
      },
      { status: 500 },
    );
  }
}
