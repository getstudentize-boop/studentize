import { db, InferSelectModel, InferInsertModel, eq } from "..";

import * as schema from "../schema";

type AdvisorSelect = InferSelectModel<typeof schema.advisor>;
type AdvisorInsert = InferInsertModel<typeof schema.advisor>;

export const createBaseAdvisor = async (data: {
  userId: string;
  universityName: string;
  courseMajor: string;
  courseMinor?: string;
}) => {
  const advisor = await db
    .insert(schema.advisor)
    .values({
      userId: data.userId,
      universityName: data.universityName,
      courseMajor: data.courseMajor,
      courseMinor: data.courseMinor,
    })
    .returning({ id: schema.advisor.id });

  return advisor;
};

export const getAdvisors = async () => {
  const advisors = await db
    .select({
      advisorId: schema.advisor.id,
      userId: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
      universityName: schema.advisor.universityName,
      courseMajor: schema.advisor.courseMajor,
      courseMinor: schema.advisor.courseMinor,
    })
    .from(schema.advisor)
    .innerJoin(schema.user, eq(schema.advisor.userId, schema.user.id));

  return advisors;
};
