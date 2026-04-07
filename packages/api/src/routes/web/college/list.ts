import { z } from "zod";
import { db, sql, schema } from "@student/db";

export const CollegeListInputSchema = z.object({
  limit: z.number().min(1).max(1000).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  state: z.string().optional(),
  campusSetting: z.enum(["City", "Suburban", "Town", "Rural"]).optional(),
  minAdmissionRate: z.number().min(0).max(1).optional(),
  maxAdmissionRate: z.number().min(0).max(1).optional(),
  minSAT: z.number().optional(),
  maxSAT: z.number().optional(),
});

export type CollegeListInput = z.infer<typeof CollegeListInputSchema>;

export const collegeListHandler = async (input: CollegeListInput) => {
  const {
    limit,
    offset,
    search,
    state,
    campusSetting,
    minAdmissionRate,
    maxAdmissionRate,
    minSAT,
    maxSAT,
  } = input;

  // Build where conditions
  const conditions: any[] = [];

  if (search) {
    conditions.push(sql`${schema.usCollege.schoolName} ILIKE ${`%${search}%`}`);
  }

  if (state) {
    conditions.push(sql`${schema.usCollege.schoolState} = ${state}`);
  }

  if (campusSetting) {
    conditions.push(sql`${schema.usCollege.campusSetting} = ${campusSetting}`);
  }

  if (minAdmissionRate !== undefined) {
    conditions.push(
      sql`CAST(${schema.usCollege.admissionRate} AS FLOAT) >= ${minAdmissionRate}`
    );
  }

  if (maxAdmissionRate !== undefined) {
    conditions.push(
      sql`CAST(${schema.usCollege.admissionRate} AS FLOAT) <= ${maxAdmissionRate}`
    );
  }

  if (minSAT !== undefined) {
    conditions.push(sql`${schema.usCollege.satScoreAverage} >= ${minSAT}`);
  }

  if (maxSAT !== undefined) {
    conditions.push(sql`${schema.usCollege.satScoreAverage} <= ${maxSAT}`);
  }

  // Combine conditions with AND
  const whereClause =
    conditions.length > 0 ? sql.join(conditions, sql.raw(" AND ")) : sql`1=1`;

  // Get total count
  const countResult = await db.execute(
    sql`SELECT COUNT(*) as count FROM ${schema.usCollege} WHERE ${whereClause}`
  );
  const total = Number(countResult[0]?.count || 0);

  // Get colleges
  const colleges = await db.execute(
    sql`
      SELECT
        id,
        school_name,
        school_city,
        school_state,
        latest_admissions_admission_rate_overall as admission_rate,
        latest_cost_tuition_out_of_state as tuition,
        latest_admissions_sat_scores_average_overall as sat_average,
        latest_student_size as student_size,
        campus_setting,
        website,
        image_url,
        overall_graduation_rate as graduation_rate,
        post_grad_earnings
      FROM ${schema.usCollege}
      WHERE ${whereClause}
      ORDER BY school_name
      LIMIT ${limit}
      OFFSET ${offset}
    `
  );

  return {
    colleges,
    total,
    hasMore: offset + limit < total,
  };
};
