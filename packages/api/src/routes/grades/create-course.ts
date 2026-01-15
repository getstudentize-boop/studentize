import { z } from "zod";
import { db, schema, createId } from "@student/db";

export const CreateCourseInputSchema = z.object({
  academicYearId: z.string(),
  name: z.string().min(1),
  code: z.string().optional(),
  category: z.enum([
    "MATHEMATICS",
    "SCIENCE",
    "ENGLISH",
    "SOCIAL_STUDIES",
    "LANGUAGE",
    "ARTS",
    "PHYSICAL_EDUCATION",
    "COMPUTER_SCIENCE",
    "BUSINESS",
    "OTHER",
  ]),
  level: z.string().optional(),
  credits: z.number().optional(),
  teacher: z.string().optional(),
  description: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseInputSchema>;

export const createCourseHandler = async (
  input: CreateCourseInput,
  ctx: { studentId: string }
) => {
  const course = await db
    .insert(schema.course)
    .values({
      id: createId(),
      studentId: ctx.studentId,
      academicYearId: input.academicYearId,
      name: input.name,
      code: input.code || null,
      category: input.category,
      level: input.level || null,
      credits: input.credits || null,
      teacher: input.teacher || null,
      description: input.description || null,
    })
    .returning();

  return course[0];
};
