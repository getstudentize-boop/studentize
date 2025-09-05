import * as schema from "../schema";
import { and, db, eq, ilike, InferInsertModel, InferSelectModel } from "..";

type UserSelect = InferSelectModel<typeof schema.user>;
type UserInsert = InferInsertModel<typeof schema.user>;

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
