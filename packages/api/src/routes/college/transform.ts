import { schema } from "@student/db";

type USCollegeRow = typeof schema.usCollege.$inferSelect;
type UKCollegeRow = typeof schema.ukCollege.$inferSelect;

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

export function transformUSCollege(c: USCollegeRow) {
  return {
    ...c,
    admissionRate: toNumber(c.admissionRate),
    tuitionOutOfState: toNumber(c.tuitionOutOfState),
    studentSize: toNumber(c.studentSize),
    totalEnrollment: toNumber(c.totalEnrollment),
    undergraduateEnrollment: toNumber(c.undergraduateEnrollment),
    graduationRate: toNumber(c.graduationRate),
    overallGraduationRate: toNumber(c.overallGraduationRate),
    postGradEarnings: toNumber(c.postGradEarnings),
    medianFamilyIncome: toNumber(c.medianFamilyIncome),
    avgFamilyIncome: toNumber(c.avgFamilyIncome),
    retentionRate: toNumber(c.retentionRate),
    shareFirstGeneration: toNumber(c.shareFirstGeneration),
    pellGrantRate: toNumber(c.pellGrantRate),
    federalLoanRate: toNumber(c.federalLoanRate),
    femaleShare: toNumber(c.femaleShare),
    maleShare: toNumber(c.maleShare),
    medianDebt: toNumber(c.medianDebt),
    totalForeignStudents: toNumber(c.totalForeignStudents),
    actScoreMidpoint: toNumber(c.actScoreMidpoint),
  };
}

export function transformUKCollege(c: UKCollegeRow) {
  return {
    ...c,
    tuitionFees: toNumber(c.tuitionFees),
    totalForeignStudents: toNumber(c.totalForeignStudents),
  };
}
