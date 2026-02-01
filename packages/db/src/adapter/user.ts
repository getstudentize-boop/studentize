import * as schema from "../schema";
import { and, db, eq, ilike, InferInsertModel, InferSelectModel, or } from "..";

type MembershipSelect = InferSelectModel<typeof schema.membership>;

export const findOrCreateUser = async (data: {
  email: string;
  organizationId: string;
}) => {
  // First, check if user exists (without requiring membership)
  const existingUser = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.email, data.email),
    columns: {
      id: true,
      email: true,
      name: true,
      status: true,
    },
  });

  if (existingUser) {
    // User exists, check if they have membership in this organization
    const membership = await db.query.membership.findFirst({
      where: (membership, { and, eq }) =>
        and(
          eq(membership.userId, existingUser.id),
          eq(membership.organizationId, data.organizationId)
        ),
      columns: {
        role: true,
        id: true,
      },
    });

    if (membership) {
      // User exists and has membership, return both
      return {
        ...existingUser,
        organization: {
          role: membership.role,
          id: membership.id,
        },
      };
    } else {
      // User exists but no membership in this org, create membership
      const [newMembership] = await db
        .insert(schema.membership)
        .values({
          userId: existingUser.id,
          organizationId: data.organizationId,
          role: "STUDENT",
        })
        .returning({
          id: schema.membership.id,
          role: schema.membership.role,
        });

      return {
        ...existingUser,
        organization: {
          role: newMembership.role,
          id: newMembership.id,
        },
      };
    }
  } else {
    // User doesn't exist, create both user and membership
    const [newUser] = await db
      .insert(schema.user)
      .values({ email: data.email })
      .returning({
        id: schema.user.id,
        email: schema.user.email,
        name: schema.user.name,
        status: schema.user.status,
      });

    const [newMembership] = await db
      .insert(schema.membership)
      .values({
        userId: newUser.id,
        organizationId: data.organizationId,
        role: "STUDENT",
      })
      .returning({
        id: schema.membership.id,
        role: schema.membership.role,
      });

    return {
      ...newUser,
      organization: {
        role: newMembership.role,
        id: newMembership.id,
      },
    };
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

export const createBaseUser = async (data: { email: string; name: string }) => {
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

export const searchStudentsByAdmin = async (input: {
  query: string;
  organizationId: string;
}) => {
  const students = await db
    .select({ userId: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .innerJoin(
      schema.membership,
      and(
        eq(schema.membership.userId, schema.user.id),
        eq(schema.membership.organizationId, input.organizationId)
      )
    )
    .where(
      and(
        eq(schema.membership.role, "STUDENT"),
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
  role: MembershipSelect["role"];
  organizationId: string;
}) => {
  const users = await db
    .select({ userId: schema.user.id, name: schema.user.name })
    .from(schema.user)
    .innerJoin(
      schema.membership,
      and(
        eq(schema.membership.userId, schema.user.id),
        eq(schema.membership.organizationId, data.organizationId)
      )
    )
    .where(
      and(
        eq(schema.membership.role, data.role),
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

export const createMembership = async (data: {
  userId: string;
  organizationId: string;
  role: MembershipSelect["role"];
}) => {
  const [membership] = await db
    .insert(schema.membership)
    .values(data)
    .returning({ id: schema.membership.id });

  return membership;
};
