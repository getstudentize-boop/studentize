import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

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

/**
 * context: we need to add the file extension, in order for the file to be
 * indexed properly in autorag. Else it will throw an error "unsupported file type"
 */
export const createTranscriptionObjectKey = (input: {
  studentUserId: string;
  sessionId: string;
  ext: string;
}) => {
  return `${input.studentUserId}/${input.sessionId}.${input.ext}`;
};

export const createTemporaryTranscriptionObjectKey = (input: {
  sessionId: string;
  ext: string;
}) => {
  return `temporary/${input.sessionId}.${input.ext}`;
};

export const createReplayObjectKey = (input: {
  sessionId: string;
  studentUserId: string;
}) => {
  return `replay/${input.studentUserId}/${input.sessionId}`;
};

type Bucket = "transcription" | "session-replay";

export const getSignedUrl = (
  bucket: Bucket,
  key: string,
  options?: { contentType?: string; type?: "put" | "get" }
) => {
  const command =
    options?.type === "get"
      ? new GetObjectCommand({ Bucket: bucket, Key: key })
      : new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: options?.contentType,
        });

  return awsGetSignedUrl(S3, command, { expiresIn: 3600 });
};

//
export const deleteFile = async (input: { bucket: Bucket; key: string }) => {
  const command = new DeleteObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
  });
  await S3.send(command);
};

export const readFile = async (input: { bucket: Bucket; key: string }) => {
  const command = new GetObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
  });

  const { Body } = await S3.send(command);
  return Body?.transformToString();
};

export const objectExists = async (input: { bucket: Bucket; key: string }) => {
  const command = new HeadObjectCommand({
    Bucket: input.bucket,
    Key: input.key,
  });

  try {
    await S3.send(command);
    return true;
  } catch (error: any) {
    // If the error is 404 (NotFound), the object doesn't exist
    if (error?.$metadata?.httpStatusCode === 404) {
      return false;
    }
    // Re-throw other errors
    throw error;
  }
};

export const uploadTextFile = async (input: {
  uploadUrl: string;
  content: string;
}) => {
  const blob = new Blob([input.content], { type: "text/plain" });
  const file = new File([blob], "transcription.txt", { type: "text/plain" });

  await fetch(input.uploadUrl, {
    method: "PUT",
    body: file,
  });
};

export const uploadReplayFile = async (input: {
  uploadUrl: string;
  file: Blob;
}) => {
  const file = new File([input.file], "replay.mp4", { type: "video/mp4" });

  await fetch(input.uploadUrl, {
    method: "PUT",
    body: file,
  });
};
