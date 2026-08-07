import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminRequest } from "./services/AuthService";

const allowedOrigins = ["https://rmsounds.site", "https://www.rmsounds.site"];

const corsHeaders = (origin: string | null) => {
  const allowOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : "https://rmsounds.site";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
};

const applyCors = (response: Response, origin: string | null) => {
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value as string);
  });
  return response;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  const normalized = pathname.replace(/\/$/, "").toLowerCase();
  const segments = pathname.split("/").filter(Boolean);

  // Allow public admin login routes without token
  const publicAllow = ["/api/admin/login", "/api/adminlogin", "/admin/login"];
  const bypassAuthRoutes = [
    "/api/admineventbookings/geteventbookings",
    "/api/admineventbookings/updateeventbookingstatus",
  ];

  if (request.method === "OPTIONS") {
    return applyCors(
      new Response(null, {
        status: 204,
      }),
      origin,
    );
  }

  if (
    publicAllow.includes(normalized) ||
    bypassAuthRoutes.includes(normalized)
  ) {
    return applyCors(NextResponse.next(), origin);
  }

  const isAdminApi =
    segments[0] === "api" &&
    Boolean(segments[1]?.toLowerCase().startsWith("admin"));
  const isAdminPage = pathname.startsWith("/admin");

  if (!isAdminApi && !isAdminPage) {
    return applyCors(NextResponse.next(), origin);
  }

  try {
    await verifyAdminRequest(request);
    return applyCors(NextResponse.next(), origin);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";

    console.error("Auth proxy rejected request:", normalized, message);

    return applyCors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 401 },
      ),
      origin,
    );
  }
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
