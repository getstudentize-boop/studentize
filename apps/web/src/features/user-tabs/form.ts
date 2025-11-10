import {
  createFormHook,
  createFormHookContexts,
  formOptions,
} from "@tanstack/react-form";

const { fieldContext, formContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  formComponents: {},
  fieldComponents: {},
  fieldContext,
  formContext,
});

export const withStudentForm = withForm;

export const studentFormOpts = formOptions({
  defaultValues: {
    curriculum: "",
    targetCountries: [] as string[],
    areasOfInterest: [] as string[],
    expectedGraduationYear: "",
    extracurricular: [] as Array<{
      type: string;
      name: string;
      hoursPerWeek: number;
      yearsOfExperience: number;
      description?: string;
    }>,
  },
});
