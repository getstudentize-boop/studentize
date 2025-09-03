import * as schema from "../schema";
import { db, InferInsertModel, InferSelectModel } from "..";

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
