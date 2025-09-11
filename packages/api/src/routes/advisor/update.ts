import { z } from "zod";
import { db, eq, schema, updateAdvisorStudentAccess } from "@student/db";

export const UpdateAdvisorInputSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  universityName: z.string().min(1),
  courseMajor: z.string().min(1),
  courseMinor: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
  studentIds: z.array(z.object({ userId: z.string() })),
});

export const updateAdvisor = async (
  data: z.infer<typeof UpdateAdvisorInputSchema>
) => {
  await db
    .update(schema.user)
    .set({
      name: data.name,
      status: data.status,
    })
    .where(eq(schema.user.id, data.userId));

  const advisor = await db.query.advisor.findFirst({
    where: eq(schema.advisor.userId, data.userId),
  });

  const advisorData = {
    universityName: data.universityName,
    courseMajor: data.courseMajor,
    courseMinor: data.courseMinor,
  };

  if (advisor) {
    await db
      .update(schema.advisor)
      .set(advisorData)
      .where(eq(schema.advisor.id, advisor.id));
  } else {
    await db.insert(schema.advisor).values({
      userId: data.userId,
      ...advisorData,
    });
  }

  await updateAdvisorStudentAccess(
    data.userId,
    data.studentIds.map((s) => s.userId)
  );

  return { success: true };
};
