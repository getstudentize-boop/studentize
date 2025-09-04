import { z } from "zod";

import { ORPCError } from "@orpc/server";

import {
  createBaseAdvisor,
  createBaseUser,
  findUserByEmail,
} from "@student/db";

export const CreateAdvisorInputSchema = z.object({
  email: z.email(),
  name: z.string().min(2),
  universityName: z.string().min(2),
  courseMajor: z.string().min(2),
  courseMinor: z.string().optional(),
});

export const createAdvisor = async (
  data: z.infer<typeof CreateAdvisorInputSchema>
) => {
  const user = await findUserByEmail(data.email);

  if (user) {
    throw new ORPCError("BAD_REQUEST", {
      message: "User with this email already exists",
    });
  }

  const newUser = await createBaseUser({
    email: data.email,
    name: data.name,
    type: "ADVISOR",
  });

  await createBaseAdvisor({
    userId: newUser.id,
    universityName: data.universityName,
    courseMajor: data.courseMajor,
    courseMinor: data.courseMinor,
  });

  return { userId: newUser.id };
};
