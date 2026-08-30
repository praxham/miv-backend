import { S3Client, PutObjectCommand, Bucket$ } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class R2Service {
  private client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  async uploadBuffer(
    key: string,
    bucketName: string,
    buffer: Buffer,
    contentType: string,
  ) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return `https://${bucketName}.${process.env.DOMAIN}/${key}`;
  }
}
