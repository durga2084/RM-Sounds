import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getISTNow(): Date {
  const now = new Date();
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + IST_OFFSET_MS);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const whatsappNumber = String(body.WhatsappNumber ?? "").trim();
    const user = String(body.User ?? "Admin").trim();

    if (!whatsappNumber) {
      return NextResponse.json(
        { success: false, message: "WhatsApp number is required." },
        { status: 400 },
      );
    }
    if (whatsappNumber.length > 20) {
      return NextResponse.json(
        {
          success: false,
          message: "WhatsApp number cannot exceed 20 characters.",
        },
        { status: 400 },
      );
    }

    await prisma.whatsappNumber.deleteMany({});

    const newRecord = await prisma.whatsappNumber.create({
      data: {
        WhatsappNumber: whatsappNumber,
        CreatedAt: getISTNow(),
        CreatedBy: user,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "WhatsApp number saved successfully.",
        data: newRecord,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("WhatsAppNumber Save Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save WhatsApp number." },
      { status: 500 },
    );
  }
}
