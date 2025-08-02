import { S3Client } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto", // R2 ignores region, but required by SDK
  endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT, // e.g. "https://<accountid>.r2.cloudflarestorage.com"
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for R2
});

export default r2Client;
