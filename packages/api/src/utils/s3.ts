import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? "";

export const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export const getSignedUrl = (
  bucket: "transcription",
  key: string,
  options?: { contentType?: string }
) => {
  const putObject = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: options?.contentType,
  });

  return awsGetSignedUrl(S3, putObject, { expiresIn: 3600 });
};
