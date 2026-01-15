import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../index";
import * as schema from "../schema";

export interface USCollegeFilters {
  search?: string;
  states?: string[];
  minAdmissionRate?: number;
  maxAdmissionRate?: number;
  minSATScore?: number;
  maxSATScore?: number;
  maxTuition?: number;
  campusSetting?: string[];
  sortBy?: "name" | "admission_rate" | "sat_score" | "tuition" | "ranking";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface UKCollegeFilters {
  search?: string;
  locations?: string[];
  maxTuition?: number;
  citySize?: string[];
  sortBy?: "name" | "tuition" | "ranking";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// US College Queries
export const searchUSColleges = async (filters: USCollegeFilters = {}) => {
  const {
    search,
    states,
    minAdmissionRate,
    maxAdmissionRate,
    minSATScore,
    maxSATScore,
    maxTuition,
    campusSetting,
    sortBy = "name",
    sortOrder = "asc",
    limit = 50,
    offset = 0,
  } = filters;

  const conditions = [];

  // Search by name, city, or alias
  if (search) {
    conditions.push(
      or(
        ilike(schema.usCollege.schoolName, `%${search}%`),
        ilike(schema.usCollege.schoolCity, `%${search}%`),
        ilike(schema.usCollege.alias, `%${search}%`)
      )
    );
  }

  // Filter by states
  if (states && states.length > 0) {
    conditions.push(inArray(schema.usCollege.schoolState, states));
  }

  // Filter by admission rate
  if (minAdmissionRate !== undefined) {
    conditions.push(
      sql`${schema.usCollege.admissionRate}::numeric >= ${minAdmissionRate}`
    );
  }
  if (maxAdmissionRate !== undefined) {
    conditions.push(
      sql`${schema.usCollege.admissionRate}::numeric <= ${maxAdmissionRate}`
    );
  }

  // Filter by SAT scores
  if (minSATScore !== undefined) {
    conditions.push(
      sql`${schema.usCollege.satScoreAverage} >= ${minSATScore}`
    );
  }
  if (maxSATScore !== undefined) {
    conditions.push(
      sql`${schema.usCollege.satScoreAverage} <= ${maxSATScore}`
    );
  }

  // Filter by tuition
  if (maxTuition !== undefined) {
    conditions.push(
      sql`${schema.usCollege.tuitionOutOfState}::numeric <= ${maxTuition}`
    );
  }

  // Filter by campus setting
  if (campusSetting && campusSetting.length > 0) {
    conditions.push(inArray(schema.usCollege.campusSetting, campusSetting));
  }

  // Build order by clause
  const direction = sortOrder === "asc" ? asc : desc;
  let orderByClauses;

  switch (sortBy) {
    case "admission_rate":
      orderByClauses = [direction(schema.usCollege.admissionRate), asc(schema.usCollege.schoolName)];
      break;
    case "sat_score":
      orderByClauses = [direction(schema.usCollege.satScoreAverage), asc(schema.usCollege.schoolName)];
      break;
    case "tuition":
      orderByClauses = [direction(schema.usCollege.tuitionOutOfState), asc(schema.usCollege.schoolName)];
      break;
    case "ranking":
      // For ranking, put NULL values last regardless of sort order
      orderByClauses = sortOrder === "asc"
        ? [
            sql`${schema.usCollege.usNewsNationalRanking} IS NULL`,
            asc(schema.usCollege.usNewsNationalRanking),
            asc(schema.usCollege.schoolName)
          ]
        : [
            sql`${schema.usCollege.usNewsNationalRanking} IS NULL`,
            desc(schema.usCollege.usNewsNationalRanking),
            asc(schema.usCollege.schoolName)
          ];
      break;
    case "name":
    default:
      orderByClauses = [direction(schema.usCollege.schoolName)];
      break;
  }

  const query = db
    .select()
    .from(schema.usCollege)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderByClauses)
    .limit(limit)
    .offset(offset);

  const colleges = await query;

  // Get total count for pagination
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.usCollege)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const [{ count }] = await countQuery;

  return {
    colleges,
    total: Number(count),
    hasMore: offset + colleges.length < Number(count),
  };
};

export const getUSCollegeById = async (id: string) => {
  const [college] = await db
    .select()
    .from(schema.usCollege)
    .where(eq(schema.usCollege.id, id));

  return college;
};

export const getUSCollegeStates = async () => {
  const states = await db
    .selectDistinct({ state: schema.usCollege.schoolState })
    .from(schema.usCollege)
    .where(sql`${schema.usCollege.schoolState} IS NOT NULL`)
    .orderBy(asc(schema.usCollege.schoolState));

  return states.map((s) => s.state).filter(Boolean);
};

// UK College Queries
export const searchUKColleges = async (filters: UKCollegeFilters = {}) => {
  const {
    search,
    locations,
    maxTuition,
    citySize,
    sortBy = "name",
    sortOrder = "asc",
    limit = 50,
    offset = 0,
  } = filters;

  const conditions = [];

  // Search by name or location
  if (search) {
    conditions.push(
      or(
        ilike(schema.ukCollege.universityName, `%${search}%`),
        ilike(schema.ukCollege.location, `%${search}%`)
      )
    );
  }

  // Filter by locations
  if (locations && locations.length > 0) {
    conditions.push(
      or(
        ...locations.map((loc) => ilike(schema.ukCollege.location, `%${loc}%`))
      )
    );
  }

  // Filter by tuition
  if (maxTuition !== undefined) {
    conditions.push(sql`${schema.ukCollege.tuitionFees}::numeric <= ${maxTuition}`);
  }

  // Filter by city size
  if (citySize && citySize.length > 0) {
    conditions.push(inArray(schema.ukCollege.sizeOfCity, citySize));
  }

  // Build order by clause
  const direction = sortOrder === "asc" ? asc : desc;
  let orderByClauses;

  switch (sortBy) {
    case "tuition":
      orderByClauses = [direction(schema.ukCollege.tuitionFees), asc(schema.ukCollege.universityName)];
      break;
    case "ranking":
      // UK colleges don't have a direct ranking field, just sort by name
      orderByClauses = [asc(schema.ukCollege.universityName)];
      break;
    case "name":
    default:
      orderByClauses = [direction(schema.ukCollege.universityName)];
      break;
  }

  const query = db
    .select()
    .from(schema.ukCollege)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderByClauses)
    .limit(limit)
    .offset(offset);

  const colleges = await query;

  // Get total count for pagination
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.ukCollege)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const [{ count }] = await countQuery;

  return {
    colleges,
    total: Number(count),
    hasMore: offset + colleges.length < Number(count),
  };
};

export const getUKCollegeById = async (id: string) => {
  const [college] = await db
    .select()
    .from(schema.ukCollege)
    .where(eq(schema.ukCollege.id, id));

  return college;
};

export const getUKCollegeLocations = async () => {
  const locations = await db
    .selectDistinct({ location: schema.ukCollege.location })
    .from(schema.ukCollege)
    .where(sql`${schema.ukCollege.location} IS NOT NULL`)
    .orderBy(asc(schema.ukCollege.location));

  return locations.map((l) => l.location).filter(Boolean);
};
