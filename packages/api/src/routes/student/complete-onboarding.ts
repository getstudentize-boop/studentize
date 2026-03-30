import { z } from "zod";
import {
  updateStudentOnboarding,
  updateUserStatus,
  updateMembershipRole,
} from "@student/db";
import { AuthContext } from "../../utils/middleware";

export const CompleteStudentOnboardingInputSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  expectedGraduationYear: z.string().optional(),
  targetCountries: z.array(z.string()).optional(),
  areasOfInterest: z.array(z.string()).optional(),
  supportAreas: z.array(z.string()).optional(),
  referralSource: z.string().optional(),
});

export const completeStudentOnboarding = async (
  ctx: AuthContext,
  data: z.infer<typeof CompleteStudentOnboardingInputSchema>
) => {
  await updateStudentOnboarding(ctx.user.id, data);

  // Auto-approve: set user status to ACTIVE and membership role to STUDENT
  await updateUserStatus(ctx.user.id, "ACTIVE");
  await updateMembershipRole(ctx.user.id, ctx.organizationId, "STUDENT");

  return { success: true };
};
