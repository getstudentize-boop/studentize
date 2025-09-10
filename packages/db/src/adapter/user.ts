import * as schema from "../schema";
import { and, db, eq, ilike, InferInsertModel, InferSelectModel } from "..";

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

export const getUserName = async (userId: string) => {
  const user = await db.query.user.findFirst({
    columns: {
      name: true,
      email: true,
    },
    where: (user, { eq }) => eq(user.id, userId),
  });

  return user;
};
