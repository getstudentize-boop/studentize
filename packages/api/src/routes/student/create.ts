import { z } from "zod";

import { ORPCError } from "@orpc/server";

import {
  createBaseStudent,
  createBaseUser,
  findUserByEmail,
} from "@student/db";

export const CreateStudentInputSchema = z.object({
  email: z.email(),
  name: z.string().min(2),
});

export const createStudent = async (
  data: z.infer<typeof CreateStudentInputSchema>
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
    type: "STUDENT",
  });

  await createBaseStudent({ userId: newUser.id });

  return { userId: newUser.id };
};
