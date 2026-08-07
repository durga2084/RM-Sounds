import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const record = await prisma.whatsappNumber.findFirst({
      orderBy: { WhatsappNumberID: "asc" },
    });

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: "No WhatsApp number found.",
          data: null,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("WhatsAppNumber Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch WhatsApp number." },
      { status: 500 },
    );
  }
}
