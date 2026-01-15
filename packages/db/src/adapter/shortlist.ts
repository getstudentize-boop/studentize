import { db, eq, and, InferInsertModel, InferSelectModel } from "..";
import * as schema from "../schema";

type ShortlistInsert = InferInsertModel<typeof schema.universityShortlist>;
type ShortlistSelect = InferSelectModel<typeof schema.universityShortlist>;

export const addToShortlist = async (data: ShortlistInsert) => {
  const [shortlistItem] = await db
    .insert(schema.universityShortlist)
    .values(data)
    .returning();

  return shortlistItem;
};

export const removeFromShortlist = async (input: {
  id: string;
  studentUserId: string;
}) => {
  await db
    .delete(schema.universityShortlist)
    .where(
      and(
        eq(schema.universityShortlist.id, input.id),
        eq(schema.universityShortlist.studentUserId, input.studentUserId)
      )
    );

  return { success: true };
};

export const updateShortlistItem = async (input: {
  id: string;
  studentUserId: string;
  category?: "reach" | "target" | "safety" | null;
  notes?: string;
}) => {
  const { id, studentUserId, ...updateData } = input;

  const [updated] = await db
    .update(schema.universityShortlist)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.universityShortlist.id, id),
        eq(schema.universityShortlist.studentUserId, studentUserId)
      )
    )
    .returning();

  return updated;
};

export const getStudentShortlist = async (studentUserId: string) => {
  const shortlist = await db.query.universityShortlist.findMany({
    where: eq(schema.universityShortlist.studentUserId, studentUserId),
  });

  return shortlist;
};

export const getStudentShortlistWithDetails = async (studentUserId: string) => {
  // Get all shortlist items
  const shortlist = await getStudentShortlist(studentUserId);

  // Separate US and UK colleges
  const usCollegeIds = shortlist
    .filter((item) => item.country === "us")
    .map((item) => item.collegeId);

  const ukCollegeIds = shortlist
    .filter((item) => item.country === "uk")
    .map((item) => item.collegeId);

  // Fetch US colleges
  const usColleges =
    usCollegeIds.length > 0
      ? await db.query.usCollege.findMany({
          where: (usCollege, { inArray }) => inArray(usCollege.id, usCollegeIds),
        })
      : [];

  // Fetch UK colleges
  const ukColleges =
    ukCollegeIds.length > 0
      ? await db.query.ukCollege.findMany({
          where: (ukCollege, { inArray }) => inArray(ukCollege.id, ukCollegeIds),
        })
      : [];

  // Combine shortlist data with college details
  const shortlistWithDetails = shortlist.map((item) => {
    if (item.country === "us") {
      const college = usColleges.find((c) => c.id === item.collegeId);
      return {
        ...item,
        college: college
          ? {
              id: college.id,
              name: college.schoolName,
              location: college.schoolCity
                ? `${college.schoolCity}, ${college.schoolState}`
                : college.schoolState || "",
              imageUrl: college.imageUrl,
              ranking: college.usNewsNationalRanking,
              acceptanceRate: college.admissionRate
                ? `${(parseFloat(college.admissionRate) * 100).toFixed(1)}%`
                : undefined,
              tuition: college.tuitionOutOfState,
              country: "us" as const,
            }
          : null,
      };
    } else {
      const college = ukColleges.find((c) => c.id === item.collegeId);
      return {
        ...item,
        college: college
          ? {
              id: college.id,
              name: college.universityName,
              location: college.location || "",
              imageUrl: college.imageUrl,
              ranking: undefined, // UK colleges don't have a simple ranking
              acceptanceRate: undefined,
              tuition: college.tuitionFees,
              country: "uk" as const,
            }
          : null,
      };
    }
  });

  return shortlistWithDetails;
};

export const checkIfInShortlist = async (input: {
  studentUserId: string;
  collegeId: string;
  country: string;
}) => {
  const [item] = await db
    .select()
    .from(schema.universityShortlist)
    .where(
      and(
        eq(schema.universityShortlist.studentUserId, input.studentUserId),
        eq(schema.universityShortlist.collegeId, input.collegeId),
        eq(schema.universityShortlist.country, input.country)
      )
    )
    .limit(1);

  return !!item;
};
