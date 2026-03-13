import { db } from "..";
import * as schema from "../schema";

export const createAdvisorInquiry = async (data: {
  fullName: string;
  email: string;
  phone: string;
}) => {
  const [row] = await db
    .insert(schema.advisorInquiry)
    .values({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    })
    .returning({ id: schema.advisorInquiry.id });

  return row!;
};
