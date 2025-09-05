import * as schema from "../schema";
import { and, db, InferInsertModel, InferSelectModel } from "..";

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
  const users = await db.query.user.findMany({
    columns: {
      id: true,
      name: true,
    },
    where: (user, { eq, ilike }) =>
      and(eq(user.type, data.type), ilike(user.name, `%${data.query}%`)),
  });

  return users;
};
