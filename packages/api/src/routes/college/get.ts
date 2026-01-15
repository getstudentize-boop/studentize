import { z } from "zod";
import { db, schema, eq } from "@student/db";

export const CollegeGetInputSchema = z.object({
  id: z.string(),
});

export type CollegeGetInput = z.infer<typeof CollegeGetInputSchema>;

export const collegeGetHandler = async (input: CollegeGetInput) => {
  const college = await db.query.usCollege.findFirst({
    where: eq(schema.usCollege.id, input.id),
  });

  if (!college) {
    throw new Error("College not found");
  }

  return college;
};
