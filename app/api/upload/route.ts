import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import cloudinary from "@/lib/cloudinary/config";

export async function POST(request: NextRequest) {
  try {
    // Require authentication for uploads
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const uploadType = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check if this is a document upload
    const isDocument = uploadType === "document";

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validPdfType = "application/pdf";
    const isValidType = validImageTypes.includes(file.type) || file.type === validPdfType;
    
    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Only images (JPEG, PNG, WebP) and PDF files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for images, 20MB for documents)
    const maxSize = isDocument ? 20 * 1024 * 1024 : 10 * 1024 * 1024; // 20MB for documents, 10MB for images
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${isDocument ? "20MB" : "10MB"} limit` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type and folder
    const isPdf = file.type === "application/pdf";
    const folder = isDocument ? "easy-car/documents" : "easy-car/vehicles";
    const resourceType = isPdf ? "raw" : "image";

    // Upload to Cloudinary
    return new Promise<NextResponse>((resolve) => {
      const uploadOptions: any = {
        folder: folder,
        resource_type: resourceType,
      };

      // Only apply image transformations for images
      if (!isPdf) {
        uploadOptions.transformation = [
          { width: 1200, height: 800, crop: "limit", quality: "auto" },
        ];
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            resolve(
              NextResponse.json(
                { error: "Upload failed", details: error.message },
                { status: 500 }
              )
            );
            return;
          }

          resolve(
            NextResponse.json({
              url: result?.secure_url,
              publicId: result?.public_id,
              width: result?.width,
              height: result?.height,
            })
          );
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}


