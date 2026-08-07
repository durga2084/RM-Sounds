import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const uploadDirectory = path.join(process.cwd(), "public", "GalleryImages");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const galleryImageId = Number(body.GalleryImageID);

    if (!galleryImageId) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid GalleryImageID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const existingImage = await prisma.websiteGallery.findUnique({
      where: {
        GalleryImageID: galleryImageId,
      },
    });

    if (!existingImage) {
      return NextResponse.json(
        {
          success: false,
          message: "Image not found.",
        },
        {
          status: 404,
        },
      );
    }

    try {
      const imagePath = path.join(uploadDirectory, existingImage.ImageFileName);

      await fs.unlink(imagePath);
    } catch (error) {
      console.warn(
        `Unable to delete image file: ${existingImage.ImageFileName}`,
        error,
      );
    }

    await prisma.websiteGallery.delete({
      where: {
        GalleryImageID: galleryImageId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete image.",
      },
      {
        status: 500,
      },
    );
  }
}
