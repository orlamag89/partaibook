// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2Uploader";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const url = await uploadToR2({
    fileBuffer: buffer,
    fileName: `${Date.now()}-${file.name}`,
    mimeType: file.type,
  });

  return NextResponse.json({ url });
}