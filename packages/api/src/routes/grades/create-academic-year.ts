import { z } from "zod";
import { db, schema, createId } from "@student/db";

export const CreateAcademicYearInputSchema = z.object({
  year: z.number().int().min(1).max(12),
  curriculum: z.enum([
    "US_HIGH_SCHOOL",
    "IB",
    "A_LEVELS",
    "CBSE",
    "ICSE",
    "AP",
    "OTHER",
  ]),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.string().optional().default("false"),
});

export type CreateAcademicYearInput = z.infer<
  typeof CreateAcademicYearInputSchema
>;

export const createAcademicYearHandler = async (
  input: CreateAcademicYearInput,
  ctx: { studentId: string }
) => {
  const academicYear = await db
    .insert(schema.academicYear)
    .values({
      id: createId(),
      studentId: ctx.studentId,
      year: input.year,
      curriculum: input.curriculum,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      isActive: input.isActive,
    })
    .returning();

  return academicYear[0];
};
