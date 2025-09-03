import { db, InferSelectModel, InferInsertModel } from "..";

import * as schema from "../schema";

import {} from "drizzle-orm/pg-core";

type StudentSelect = InferSelectModel<typeof schema.student>;
type StudentUser = InferInsertModel<typeof schema.student>;

export const createBaseStudent = async (data: { userId: string }) => {
  const student = await db
    .insert(schema.student)
    .values({ userId: data.userId })
    .returning({ id: schema.student.id });

  return student;
};
