import { z } from "zod";
import { getStudentByUserId } from "@student/db";
import type { Context } from "../../utils/middleware";

export const GetMyProfileInputSchema = z.object({});

export type GetMyProfileInput = z.infer<typeof GetMyProfileInputSchema>;

export const getMyProfile = async (context: Context, _input: GetMyProfileInput) => {
  if (!context.user) {
    throw new Error("User not authenticated");
  }

  const student = await getStudentByUserId(context.user.id);

  // Return null if student profile doesn't exist yet (pending user)
  // The frontend will handle this gracefully
  return student || null;
};
