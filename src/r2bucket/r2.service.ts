import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadBuffer = async (
  key: string,
  folderName: string,
  buffer: Buffer,
  contentType: string,
) => {
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return `https://assets.${process.env.DOMAIN}/${key}`;
};

export const deleteBuffer = async (key: string) => {
  return await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    }),
  );
};

export const extractKeyFromUrl = (fileUrl: string) => {
  if (!fileUrl) return null;
  try {
    const urlObj = new URL(fileUrl);
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error("Invalid URL format:", fileUrl);
    return null;
  }
};
