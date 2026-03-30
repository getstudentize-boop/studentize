import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import {
  PlusIcon,
  ClockIcon,
  TrashIcon,
  GraduationCapIcon,
  BookOpenIcon,
  StarIcon,
} from "@phosphor-icons/react";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/button";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/input";
import { format } from "date-fns";
import { countWordsInTiptap } from "@/utils/essay";
import { z } from "zod";

const essayRegions = ["All", "US", "UK", "Other"] as const;
type EssayRegion = (typeof essayRegions)[number];

export const Route = createFileRoute("/_authenticated/essays/")({
  component: EssaysPage,
  validateSearch: z.object({
    region: z.enum(essayRegions).catch("All").default("All"),
  }),
});

const ESSAY_TYPES = {
  COMMON_APP: "Common App",
  UK_PERSONAL_STATEMENT: "UK Personal Statement",
  SUPPLEMENTAL: "Supplemental",
  OTHER: "Other",
};

const COMMON_APP_PROMPTS = [
  "Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.",
  "The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?",
  "Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?",
  "Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?",
  "Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.",
  "Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?",
  "Share an essay on any topic of your choice. It can be one you've already written, one that responds to a different prompt, or one of your own design.",
];

const UK_PERSONAL_STATEMENT_PROMPTS = [
  "Why do you want to study this course or subject?",
  "How have your qualifications and studies helped you to prepare for this course or subject?",
  "What else have you done to prepare outside of education, and why are these experiences useful?",
];

function EssaysPage() {
  const [showNewEssayDialog, setShowNewEssayDialog] = useState(false);
  const [newEssayType, setNewEssayType] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { region } = Route.useSearch();

  const setRegion = (r: EssayRegion) => {
    navigate({ to: "/essays", search: { region: r } });
  };

  const essaysQuery = useQuery(orpc.essay.list.queryOptions({ input: {} }));

  const createEssayMutation = useMutation(
    orpc.essay.create.mutationOptions({
      onSuccess: (essay) => {
        queryClient.invalidateQueries({
          queryKey: orpc.essay.list.key(),
        });
        setShowNewEssayDialog(false);
        setNewEssayType(null);
        navigate({ to: `/essays/${essay.id}` });
      },
    }),
  );

  const deleteEssayMutation = useMutation(
    orpc.essay.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.essay.list.key(),
        });
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      title: "",
      prompt: "",
      university: "",
      selectedPromptIndex: "",
    },
    onSubmit: async ({ value }) => {
      let title =
        newEssayType === ESSAY_TYPES.SUPPLEMENTAL && value.university
          ? `${value.university} - ${value.title}`
          : value.title;

      // For Common App, use selected prompt
      let prompt = value.prompt;
      if (
        newEssayType === ESSAY_TYPES.COMMON_APP &&
        value.selectedPromptIndex
      ) {
        const index = parseInt(value.selectedPromptIndex);
        prompt = COMMON_APP_PROMPTS[index];
      }

      // For UK Personal Statement, use selected prompt
      if (
        newEssayType === ESSAY_TYPES.UK_PERSONAL_STATEMENT &&
        value.selectedPromptIndex
      ) {
        const index = parseInt(value.selectedPromptIndex);
        prompt = UK_PERSONAL_STATEMENT_PROMPTS[index];
        title = `UCAS Personal Statement - Question ${index + 1}`;
      }

      await createEssayMutation.mutateAsync({
        title,
        prompt: prompt || undefined,
      });
    },
  });

  const essays = essaysQuery.data || [];

  if (essaysQuery.isLoading) {
    return <PageLoader message="Loading essays..." />;
  }

  // Categorize essays
  const commonAppEssays = essays.filter((e: any) =>
    e.title.toLowerCase().includes("common app"),
  );

  // Group supplemental essays by university
  const supplementalEssays = essays.filter(
    (e: any) =>
      !e.title.toLowerCase().includes("common app") &&
      (e.title.includes(" - ") || e.title.toLowerCase().includes("supplement")),
  );

  const isUkEssay = (e: any) => {
    const t = e.title.toLowerCase();
    return (
      t.includes("ucas") ||
      t.includes("personal statement") ||
      t.includes("uk ") ||
      t.includes("uk-") ||
      t.includes("united kingdom") ||
      t.includes("oxbridge") ||
      t.includes("oxford") ||
      t.includes("cambridge")
    );
  };

  const remainingEssays = essays.filter(
    (e: any) =>
      !e.title.toLowerCase().includes("common app") &&
      !e.title.includes(" - ") &&
      !e.title.toLowerCase().includes("supplement"),
  );

  const ukEssays = remainingEssays.filter(isUkEssay);
  const otherEssays = remainingEssays.filter((e: any) => !isUkEssay(e));

  // Group supplemental essays by university
  const groupedSupplementals = supplementalEssays.reduce(
    (acc: any, essay: any) => {
      const university = essay.title.split(" - ")[0] || "Other";
      if (!acc[university]) {
        acc[university] = [];
      }
      acc[university].push(essay);
      return acc;
    },
    {},
  );

  const EssayCard = ({ essay }: { essay: any }) => {
    const wordCount = essay.content ? countWordsInTiptap(essay.content) : 0;

    return (
      <div className="bg-white rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition-all group">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-zinc-900 text-sm line-clamp-1 flex-1">
            {essay.title.includes(" - ")
              ? essay.title.split(" - ")[1]
              : essay.title}
          </h4>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (
                confirm(
                  "Are you sure you want to delete this essay? This cannot be undone.",
                )
              ) {
                deleteEssayMutation.mutate({ essayId: essay.id });
              }
            }}
            className="text-zinc-400 hover:text-red-600 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>

        {essay.prompt && (
          <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
            {essay.prompt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="flex items-center">
              <ClockIcon className="size-3 mr-1" />
              {format(new Date(essay.updatedAt), "MMM d")}
            </div>
            <div className="text-zinc-400">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </div>
          </div>
          <Link to={`/essays/${essay.id}`}>
            <Button variant="neutral" className="text-xs py-1 px-2 h-auto">
              Edit
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 h-screen text-left">
      <div className="flex-1 flex flex-col overflow-auto bg-zinc-50">
        <div className="flex justify-center bg-white mb-6 border-b border-zinc-200 px-6 pt-6 w-full">
          <div className="mx-auto max-w-5xl w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-zinc-900">
                My Essays
              </h1>
              <p className="text-zinc-600 text-sm mt-1">
                Organize and write your college application essays
              </p>
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-2 border-b border-zinc-200">
                {essayRegions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                      region === r
                        ? "text-blue-600"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {r}
                    {region === r && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto w-full p-6">
          {showNewEssayDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">
                  Create New Essay
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  {newEssayType === ESSAY_TYPES.SUPPLEMENTAL && (
                    <form.Field name="university">
                      {(field) => (
                        <div>
                          <label className="text-sm font-medium text-zinc-700 mb-1 block">
                            University Name
                          </label>
                          <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g., Stanford University"
                            required
                          />
                        </div>
                      )}
                    </form.Field>
                  )}
                  {newEssayType !== ESSAY_TYPES.COMMON_APP &&
                    newEssayType !== ESSAY_TYPES.UK_PERSONAL_STATEMENT && (
                      <form.Field name="title">
                        {(field) => (
                          <div>
                            <label className="text-sm font-medium text-zinc-700 mb-1 block">
                              Essay Title
                            </label>
                            <Input
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder={
                                newEssayType === ESSAY_TYPES.SUPPLEMENTAL
                                  ? "e.g., Why Stanford?"
                                  : "e.g., Scholarship Essay"
                              }
                              required
                            />
                          </div>
                        )}
                      </form.Field>
                    )}
                  {newEssayType === ESSAY_TYPES.COMMON_APP ||
                  newEssayType === ESSAY_TYPES.UK_PERSONAL_STATEMENT ? (
                    <form.Field name="selectedPromptIndex">
                      {(field) => {
                        const prompts =
                          newEssayType === ESSAY_TYPES.COMMON_APP
                            ? COMMON_APP_PROMPTS
                            : UK_PERSONAL_STATEMENT_PROMPTS;
                        const selectedClass =
                          newEssayType === ESSAY_TYPES.COMMON_APP
                            ? "border-blue-500 bg-blue-50"
                            : "border-green-500 bg-green-50";
                        return (
                          <div>
                            <label className="text-sm font-medium text-zinc-700 mb-2 block">
                              Choose Your Prompt
                            </label>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {prompts.map((prompt, index) => (
                                <label
                                  key={index}
                                  className={`flex gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                    field.state.value === String(index)
                                      ? selectedClass
                                      : "border-zinc-300 hover:border-zinc-400"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="prompt"
                                    value={String(index)}
                                    checked={
                                      field.state.value === String(index)
                                    }
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    className="mt-1 flex-shrink-0"
                                  />
                                  <span className="text-sm text-zinc-700">
                                    {index + 1}. {prompt}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }}
                    </form.Field>
                  ) : (
                    <form.Field name="prompt">
                      {(field) => (
                        <div>
                          <label className="text-sm font-medium text-zinc-700 mb-1 block">
                            Essay Prompt (Optional)
                          </label>
                          <textarea
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Paste the essay prompt or question here..."
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm min-h-[80px]"
                          />
                        </div>
                      )}
                    </form.Field>
                  )}
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="neutral"
                      onClick={() => {
                        setShowNewEssayDialog(false);
                        setNewEssayType(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={createEssayMutation.isPending}
                    >
                      {createEssayMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {(region === "All" || region === "US") && (
              <>
                {/* Common App Section */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <StarIcon
                          className="size-5 text-blue-600"
                          weight="fill"
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold text-zinc-900">
                          Common App Personal Statement
                        </h2>
                        <p className="text-xs text-zinc-500">
                          650 words • Required for most schools
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setNewEssayType(ESSAY_TYPES.COMMON_APP);
                        setShowNewEssayDialog(true);
                        form.reset();
                        form.setFieldValue(
                          "title",
                          "Common App Personal Statement",
                        );
                      }}
                      className="text-sm"
                    >
                      <PlusIcon className="size-4" weight="bold" />
                      Add Essay
                    </Button>
                  </div>

                  {commonAppEssays.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {commonAppEssays.map((essay: any) => (
                        <EssayCard key={essay.id} essay={essay} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
                      <BookOpenIcon className="size-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">
                        Start your Common App personal statement
                      </p>
                    </div>
                  )}
                </div>

                {/* Supplemental Essays Section */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <GraduationCapIcon
                          className="size-5 text-purple-600"
                          weight="fill"
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold text-zinc-900">
                          Supplemental Essays
                        </h2>
                        <p className="text-xs text-zinc-500">
                          School-specific essays
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="neutral"
                      onClick={() => {
                        setNewEssayType(ESSAY_TYPES.SUPPLEMENTAL);
                        setShowNewEssayDialog(true);
                        form.reset();
                      }}
                      className="text-sm"
                    >
                      <PlusIcon className="size-4" weight="bold" />
                      Add Essay
                    </Button>
                  </div>

                  {Object.keys(groupedSupplementals).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedSupplementals).map(
                        ([university, universityEssays]: [string, any]) => (
                          <div key={university}>
                            <h3 className="font-medium text-zinc-700 text-sm mb-2">
                              {university}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {universityEssays.map((essay: any) => (
                                <EssayCard key={essay.id} essay={essay} />
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
                      <GraduationCapIcon className="size-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500 mb-3">
                        No supplemental essays yet
                      </p>
                      <p className="text-xs text-zinc-400">
                        Add essays for specific universities you're applying to
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {(region === "All" || region === "UK") && (
              <>
                {/* UCAS Personal Statement Section */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <StarIcon
                          className="size-5 text-green-600"
                          weight="fill"
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold text-zinc-900">
                          UCAS Personal Statement
                        </h2>
                        <p className="text-xs text-zinc-500">
                          4,000 characters • Answer all three questions
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setNewEssayType(ESSAY_TYPES.UK_PERSONAL_STATEMENT);
                        setShowNewEssayDialog(true);
                        form.reset();
                      }}
                      className="text-sm"
                    >
                      <PlusIcon className="size-4" weight="bold" />
                      Add Question
                    </Button>
                  </div>

                  {ukEssays.filter((e: any) =>
                    e.title.toLowerCase().includes("ucas personal statement"),
                  ).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ukEssays
                        .filter((e: any) =>
                          e.title
                            .toLowerCase()
                            .includes("ucas personal statement"),
                        )
                        .map((essay: any) => (
                          <EssayCard key={essay.id} essay={essay} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
                      <BookOpenIcon className="size-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">
                        Start your UCAS personal statement
                      </p>
                    </div>
                  )}
                </div>

                {/* Other UK Essays Section */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <GraduationCapIcon
                          className="size-5 text-green-600"
                          weight="fill"
                        />
                      </div>
                      <div>
                        <h2 className="font-semibold text-zinc-900">
                          Other UK Essays
                        </h2>
                        <p className="text-xs text-zinc-500">
                          University-specific essays & additional statements
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="neutral"
                      onClick={() => {
                        setNewEssayType(ESSAY_TYPES.OTHER);
                        setShowNewEssayDialog(true);
                        form.reset();
                      }}
                      className="text-sm"
                    >
                      <PlusIcon className="size-4" weight="bold" />
                      Add Essay
                    </Button>
                  </div>

                  {ukEssays.filter(
                    (e: any) =>
                      !e.title
                        .toLowerCase()
                        .includes("ucas personal statement"),
                  ).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ukEssays
                        .filter(
                          (e: any) =>
                            !e.title
                              .toLowerCase()
                              .includes("ucas personal statement"),
                        )
                        .map((essay: any) => (
                          <EssayCard key={essay.id} essay={essay} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
                      <GraduationCapIcon className="size-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500 mb-3">
                        No other UK essays yet
                      </p>
                      <p className="text-xs text-zinc-400">
                        Add essays for specific universities you're applying to
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {(region === "All" || region === "Other") && (
              <div className="bg-white rounded-lg border border-zinc-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <BookOpenIcon
                        className="size-5 text-amber-600"
                        weight="fill"
                      />
                    </div>
                    <div>
                      <h2 className="font-semibold text-zinc-900">
                        Other Essays
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Scholarships, honors programs & other applications
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="neutral"
                    onClick={() => {
                      setNewEssayType(ESSAY_TYPES.OTHER);
                      setShowNewEssayDialog(true);
                      form.reset();
                    }}
                    className="text-sm"
                  >
                    <PlusIcon className="size-4" weight="bold" />
                    Add Essay
                  </Button>
                </div>

                {otherEssays.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {otherEssays.map((essay: any) => (
                      <EssayCard key={essay.id} essay={essay} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
                    <BookOpenIcon className="size-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 mb-3">
                      No other essays yet
                    </p>
                    <p className="text-xs text-zinc-400">
                      Add essays for scholarships, Canada applications, or other
                      programs
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
