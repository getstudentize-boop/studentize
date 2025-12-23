import { createRouteHelper } from "../../utils/middleware";
import {
  createTemporaryTranscriptionObjectKey,
  readFile,
} from "../../utils/s3";
import { ORPCError } from "@orpc/server";
import z from "zod";

export const ReadTemporaryTranscriptionSchema = z.object({
  sessionId: z.string(),
});

export const readTemporaryTranscription = createRouteHelper({
  inputSchema: ReadTemporaryTranscriptionSchema,
  execute: async ({ ctx, input }) => {
    if (ctx.user.type !== "ADMIN") {
      throw new ORPCError("UNAUTHORIZED");
    }

    const { sessionId } = input;

    const content = await readFile({
      bucket: "transcription",
      key: createTemporaryTranscriptionObjectKey({ ext: "txt", sessionId }),
    });

    return content;
  },
});
