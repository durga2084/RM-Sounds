import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sign } from "@/services/SimpleJwt";
import {
  getActiveSessionWhere,
  getExpiredSessionWhere,
} from "@/services/adminSessionFilters";

function tryDecodePassword(encoded: string | undefined): string {
  if (!encoded) return "";

  let decoded = String(encoded);

  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // ignore
  }

  try {
    const b = Buffer.from(decoded, "base64").toString("utf8");
    if (
      Buffer.from(b, "utf8").toString("base64") === decoded.replace(/\s+/g, "")
    ) {
      decoded = b;
    }
  } catch {
    // ignore
  }

  return decoded;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { Username, Password, DeviceInfo } = body ?? {};

    if (typeof Username !== "string" || Username.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required.",
        },
        { status: 400 },
      );
    }

    if (typeof Password !== "string" || Password.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.adminLogins.findFirst({
      where: {
        AdminUsername: Username.trim(),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    const plain = tryDecodePassword(Password);

    const sha1 = crypto.createHash("sha1").update(plain).digest("hex");

    if (sha1 !== user.AdminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials.",
        },
        { status: 401 },
      );
    }

    const now = new Date();

    await prisma.adminSessions.updateMany({
      where: getExpiredSessionWhere(user.AdminLoginID, now),
      data: { IsActive: false },
    });

    const activeCount = await prisma.adminSessions.count({
      where: getActiveSessionWhere(user.AdminLoginID, now),
    });

    if (activeCount >= 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum of 5 active devices allowed.",
        },
        { status: 403 },
      );
    }

    const jwtSecret =
      process.env.JWT_SECRET || "hkhjjkg23423RM338soundseuitioerutiore";

    const token = await sign(
      {
        AdminLoginID: user.AdminLoginID,
        AdminUsername: user.AdminUsername,
      },
      jwtSecret,
      30 * 24 * 60 * 60,
    );

    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "";

    const session = await prisma.adminSessions.create({
      data: {
        AdminLoginID: user.AdminLoginID,
        Token: token,
        DeviceInfo: DeviceInfo ?? null,
        IPAddress: ip,
        IsActive: true,
        CreatedAt: now,
        ExpiresAt: expiresAt,
      },
    });

    await prisma.adminLogTimings.create({
      data: {
        UserName: user.AdminUsername,
        LogStatus: "Login",
        LoginAt: now,
        CreatedAt: now,
      },
    });

    const res = NextResponse.json({
      success: true,
      message: "Login successful.",
      token,
      sessionId: session.SessionID,
      data: {
        AdminLoginID: user.AdminLoginID,
        AdminUsername: user.AdminUsername,
      },
    });

    // Set cookie so the token is available across subdomains (www and root).
    const cookieDomain = process.env.COOKIE_DOMAIN || ".rmsounds.site";

    try {
      res.cookies.set("token", token, {
        path: "/",
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        domain: cookieDomain,
        maxAge: 30 * 24 * 60 * 60,
      });
    } catch (err) {
      // Some Next.js runtimes may not support res.cookies.set; fall back to header
      const cookie = `token=${token}; Path=/; Max-Age=${30 * 24 * 60 * 60}; Domain=${cookieDomain}; SameSite=Lax; Secure`;
      res.headers.set("Set-Cookie", cookie);
    }

    return res;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    console.error("Login API Error:", message);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed.",
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}
