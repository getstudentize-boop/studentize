import * as schema from "../schema";
import { and, db, eq, ilike, InferInsertModel, InferSelectModel, or } from "..";

type UserSelect = InferSelectModel<typeof schema.user>;
type UserInsert = InferInsertModel<typeof schema.user>;

export const findOrCreateUser = async (data: { email: string }) => {
  const user = await db.query.user.findFirst({
    columns: {
      id: true,
      status: true,
      type: true,
    },
    where: (user, { eq }) => eq(user.email, data.email),
  });

  if (user) {
    return user;
  } else {
    const [newUser] = await db
      .insert(schema.user)
      .values({ email: data.email, type: "ADVISOR" })
      .returning({
        id: schema.user.id,
        status: schema.user.status,
        type: schema.user.type,
      });

    return newUser;
  }
};

export const findUserByEmail = async (email: string) => {
  const user = await db.query.user.findFirst({
    columns: {
      id: true,
    },
    where: (user, { eq }) => eq(user.email, email),
  });

  return user;
};

export const createBaseUser = async (data: {
  email: string;
  name: string;
  type: UserInsert["type"];
}) => {
  const [user] = await db
    .insert(schema.user)
    .values(data)
    .returning({ id: schema.user.id });

  return user;
};

export const searchStudentsByAdvisor = async (input: {
  advisorUserId: string;
  query: string;
}) => {
  const andStatements = [
    eq(schema.advisorStudentAccess.advisorUserId, input.advisorUserId),
    input.query
      ? or(
          ilike(schema.user.name, `%${input.query}%`),
          ilike(schema.user.email, `%${input.query}%`)
        )
      : undefined,
  ];

  const students = await db
    .select({ userId: schema.user.id, name: schema.user.name })
    .from(schema.advisorStudentAccess)
    .innerJoin(
      schema.user,
      eq(schema.advisorStudentAccess.studentUserId, schema.user.id)
    )
    .where(and(...andStatements));

  return students;
};

export const searchStudentsByAdmin = async (input: { query: string }) => {
  const students = await db
    .select({ userId: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .where(
      and(
        eq(schema.user.type, "STUDENT"),
        input.query
          ? or(
              ilike(schema.user.name, `%${input.query}%`),
              ilike(schema.user.email, `%${input.query}%`)
            )
          : undefined
      )
    );

  return students;
};

export const searchUserByName = async (data: {
  query: string;
  type: UserSelect["type"];
}) => {
  const users = await db
    .select({ userId: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .where(
      and(
        eq(schema.user.type, data.type),
        ilike(schema.user.name, `%${data.query}%`)
      )
    );

  return users;
};

export const getUserName = async (input: { userId: string }) => {
  const { userId } = input;

  const user = await db.query.user.findFirst({
    columns: {
      name: true,
      email: true,
    },
    where: (user, { eq }) => eq(user.id, userId),
  });

  return user;
};

export const updateUserEmail = async (
  userId: string,
  data: { email: string }
) => {
  const [user] = await db
    .update(schema.user)
    .set({ email: data.email })
    .where(eq(schema.user.id, userId))
    .returning({ id: schema.user.id, email: schema.user.email });

  return user;
};

export const getUserById = (input: { userId: string }) => {
  return db.query.user.findFirst({
    columns: {
      name: true,
      id: true,
    },
    where: eq(schema.user.id, input.userId),
  });
};
