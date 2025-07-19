// src/app/lib/r2Uploader.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: process.env.R2_REGION!,
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2({
  fileBuffer,
  fileName,
  mimeType,
}: {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await r2.send(command);

  return `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${fileName}`;
}