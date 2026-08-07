import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const uploadDirectory = path.join(process.cwd(), "public", "GalleryImages");

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

function generateRandomFileName(extension: string): string {
  return `${crypto.randomBytes(16).toString("hex")}${extension.toLowerCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const createdBy = String(formData.get("CreatedBy") ?? "Admin");

    const files = formData.getAll("Images") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select at least one image.",
        },
        {
          status: 400,
        },
      );
    }

    await fs.mkdir(uploadDirectory, {
      recursive: true,
    });

    const uploadedImages = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      const extension = path.extname(file.name).toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        return NextResponse.json(
          {
            success: false,
            message: `${file.name} is not a supported image.`,
          },
          {
            status: 400,
          },
        );
      }

      const randomFileName = generateRandomFileName(extension);

      const buffer = Buffer.from(await file.arrayBuffer());

      const savePath = path.join(uploadDirectory, randomFileName);

      await fs.writeFile(savePath, buffer);

      const imageUrl = `/GalleryImages/${randomFileName}`;

      const galleryImage = await prisma.websiteGallery.create({
        data: {
          ImageFileName: randomFileName,
          ImageUrl: imageUrl,
          CreatedAt: new Date(),
          CreatedBy: createdBy,
        },

        select: {
          GalleryImageID: true,
          ImageUrl: true,
          ImageFileName: true,
        },
      });

      uploadedImages.push(galleryImage);
    }

    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully.",
      data: uploadedImages,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload images.",
      },
      {
        status: 500,
      },
    );
  }
}
