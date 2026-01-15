import { privateRoute } from "../../utils/middleware";
import {
  createAcademicYearHandler,
  CreateAcademicYearInputSchema,
} from "./create-academic-year";
import {
  listAcademicYearsHandler,
  ListAcademicYearsInputSchema,
} from "./list-academic-years";
import { createCourseHandler, CreateCourseInputSchema } from "./create-course";
import { listCoursesHandler, ListCoursesInputSchema } from "./list-courses";
import { addGradeHandler, AddGradeInputSchema } from "./add-grade";
import { listGradesHandler, ListGradesInputSchema } from "./list-grades";
import { calculateGPAHandler, CalculateGPAInputSchema } from "./calculate-gpa";
import { getDashboardHandler, GetDashboardInputSchema } from "./get-dashboard";

const createAcademicYearRouteHandler = privateRoute
  .input(CreateAcademicYearInputSchema)
  .handler(async ({ input, context }) => {
    const studentId = context.session.claims.sub;
    return await createAcademicYearHandler(input, { studentId });
  });

const listAcademicYearsRouteHandler = privateRoute
  .input(ListAcademicYearsInputSchema)
  .handler(async ({ input, context }) => {
    const studentId = context.session.claims.sub;
    return await listAcademicYearsHandler(input, { studentId });
  });

const createCourseRouteHandler = privateRoute
  .input(CreateCourseInputSchema)
  .handler(async ({ input, context }) => {
    const studentId = context.session.claims.sub;
    return await createCourseHandler(input, { studentId });
  });

const listCoursesRouteHandler = privateRoute
  .input(ListCoursesInputSchema)
  .handler(async ({ input, context }) => {
    const studentId = context.session.claims.sub;
    return await listCoursesHandler(input, { studentId });
  });

const addGradeRouteHandler = privateRoute
  .input(AddGradeInputSchema)
  .handler(async ({ input }) => {
    return await addGradeHandler(input);
  });

const listGradesRouteHandler = privateRoute
  .input(ListGradesInputSchema)
  .handler(async ({ input }) => {
    return await listGradesHandler(input);
  });

const calculateGPARouteHandler = privateRoute
  .input(CalculateGPAInputSchema)
  .handler(async ({ input, context }) => {
    const studentId = context.session.claims.sub;
    return await calculateGPAHandler(input, { studentId });
  });

const getDashboardRouteHandler = privateRoute
  .input(GetDashboardInputSchema)
  .handler(async ({ input, context }) => {
    const studentId = context.session.claims.sub;
    return await getDashboardHandler(input, { studentId });
  });

export const grades = {
  createAcademicYear: createAcademicYearRouteHandler,
  listAcademicYears: listAcademicYearsRouteHandler,
  createCourse: createCourseRouteHandler,
  listCourses: listCoursesRouteHandler,
  addGrade: addGradeRouteHandler,
  listGrades: listGradesRouteHandler,
  calculateGPA: calculateGPARouteHandler,
  getDashboard: getDashboardRouteHandler,
};
