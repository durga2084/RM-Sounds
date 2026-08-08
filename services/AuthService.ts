import { NextRequest } from "next/server";
import { verify } from "@/services/SimpleJwt";

export interface AdminJwtPayload {
  AdminLoginID?: number;
  AdminUsername?: string;
  [key: string]: unknown;
}

export async function verifyAdminRequest(request: NextRequest): Promise<{
  token: string;
  payload: AdminJwtPayload;
}> {
  const authHeader = request.headers.get("authorization") || "";

  let token = "";

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const cookie = request.cookies.get("token");
    token = cookie?.value || "";
  }

  if (!token) {
    throw new Error("No token provided");
  }

  const jwtSecret = process.env.JWT_SECRET || "CHANGE_ME";

  try {
    const payload = await verify(token, jwtSecret);

    return {
      token,
      payload: payload as AdminJwtPayload,
    };
  } catch {
    throw new Error("Invalid token");
  }
}
