import { NextRequest } from "next/server";
import { verify } from "@/services/SimpleJwt";

export async function verifyAdminRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";

  let token = "";

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const cookie = request.cookies.get("token");
    token = cookie?.value || "";
  }

  if (!token) throw new Error("No token provided");

  const jwtSecret = process.env.JWT_SECRET || "CHANGE_ME";

  try {
    await verify(token, jwtSecret);
  } catch (err) {
    throw new Error("Invalid token");
  }

  return { token };
}
