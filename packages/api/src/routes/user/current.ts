import { AuthContext } from "../../utils/middleware";
import { getStudentOnboardingStatus } from "@student/db";

export const getCurrentUser = async (ctx: AuthContext) => {
  const user = ctx.user;

  // If user is a student, check onboarding status
  if (user.organization.role === "STUDENT") {
    const onboardingCompleted = await getStudentOnboardingStatus(user.id);
    return {
      ...user,
      onboardingCompleted,
    };
  }

  return { user, onboardingCompleted: false };
};
