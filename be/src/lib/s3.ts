import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getAwsSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";
import crypto from "crypto";

const isConfigured = Boolean(
  env.AWS_S3_BUCKET &&
  env.AWS_S3_REGION &&
  env.AWS_ACCESS_KEY_ID &&
  env.AWS_SECRET_ACCESS_KEY
);

// Fallback empty client if not configured, allowing app to start but fail on usage
const s3Client = isConfigured
  ? new S3Client({
      region: env.AWS_S3_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : (null as unknown as S3Client);

export async function uploadFile(
  file: Express.Multer.File,
  boardId: string,
  taskId: string
): Promise<{ url: string; key: string }> {
  if (!isConfigured) {
    throw new Error("AWS S3 is not configured");
  }

  const uuid = crypto.randomUUID();
  // Safe filename, replacing spaces with dashes
  const safeName = file.originalname.replace(/\s+/g, '-');
  const key = `taskbox/${boardId}/${taskId}/${uuid}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // URL format for standard public buckets
  const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`;
  
  return { url, key };
}

export async function deleteFile(key: string): Promise<void> {
  if (!isConfigured) {
    throw new Error("AWS S3 is not configured");
  }

  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

export async function getSignedUrl(key: string): Promise<string> {
  if (!isConfigured) {
    throw new Error("AWS S3 is not configured");
  }

  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });

  // URL expires in 1 hour
  return getAwsSignedUrl(s3Client, command, { expiresIn: 3600 });
}
