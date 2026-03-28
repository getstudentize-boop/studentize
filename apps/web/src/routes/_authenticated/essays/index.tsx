import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import {
  PlusIcon,
  ClockIcon,
  TrashIcon,
  GraduationCapIcon,
  BookOpenIcon,
  StarIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/button";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/input";
import { format } from "date-fns";
import { countWordsInTiptap } from "@/utils/essay";
import { z } from "zod";

const essayRegions = ["USA", "UK", "Other"] as const;
type EssayRegion = (typeof essayRegions)[number];

export const Route = createFileRoute("/_authenticated/essays/")({
  component: EssaysPage,
  validateSearch: z.object({
    region: z.enum(essayRegions).optional().default("USA"),
  }),
});

const ESSAY_TYPES = {
  COMMON_APP: "Common App",
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
    })
  );

  const deleteEssayMutation = useMutation(
    orpc.essay.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.essay.list.key(),
        });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      title: "",
      prompt: "",
      university: "",
      selectedPromptIndex: "",
    },
    onSubmit: async ({ value }) => {
      const title =
        newEssayType === ESSAY_TYPES.SUPPLEMENTAL && value.university
          ? `${value.university} - ${value.title}`
          : value.title;

      // For Common App, use selected prompt or custom prompt
      let prompt = value.prompt;
      if (
        newEssayType === ESSAY_TYPES.COMMON_APP &&
        value.selectedPromptIndex
      ) {
        const index = parseInt(value.selectedPromptIndex);
        prompt = COMMON_APP_PROMPTS[index];
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
  const commonAppEssay = essays.find((e: any) =>
    e.title.toLowerCase().includes("common app")
  );

  // Group supplemental essays by university
  const supplementalEssays = essays.filter(
    (e: any) =>
      !e.title.toLowerCase().includes("common app") &&
      (e.title.includes(" - ") || e.title.toLowerCase().includes("supplement"))
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
      !e.title.toLowerCase().includes("supplement")
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
    {}
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
                  "Are you sure you want to delete this essay? This cannot be undone."
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
      <div className="flex-1 flex flex-col p-6 overflow-auto bg-zinc-50">
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">My Essays</h1>
              <p className="text-zinc-600 text-sm mt-1">
                Organize and write your college application essays
              </p>
            </div>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as EssayRegion)}
                className="appearance-none bg-white border border-zinc-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {essayRegions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <CaretDownIcon className="size-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

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
                  {newEssayType !== ESSAY_TYPES.COMMON_APP && (
                    <form.Field name="title">
                      {(field) => (
                        <div>
                          <label className="text-sm font-medium text-zinc-700 mb-1 block">
                            Essay Title
                          </label>
                          <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
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
                  {newEssayType === ESSAY_TYPES.COMMON_APP ? (
                    <form.Field name="selectedPromptIndex">
                      {(field) => (
                        <div>
                          <label className="text-sm font-medium text-zinc-700 mb-2 block">
                            Choose Your Prompt
                          </label>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {COMMON_APP_PROMPTS.map((prompt, index) => (
                              <label
                                key={index}
                                className={`flex gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                  field.state.value === String(index)
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-zinc-300 hover:border-zinc-400"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="prompt"
                                  value={String(index)}
                                  checked={field.state.value === String(index)}
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
                      )}
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
            {region === "USA" && (
              <>
                {/* Common App Section */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <StarIcon className="size-5 text-blue-600" weight="fill" />
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
                    {!commonAppEssay && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setNewEssayType(ESSAY_TYPES.COMMON_APP);
                          setShowNewEssayDialog(true);
                          form.reset();
                          form.setFieldValue(
                            "title",
                            "Common App Personal Statement"
                          );
                        }}
                        className="text-sm"
                      >
                        <PlusIcon className="size-4" weight="bold" />
                        Start Writing
                      </Button>
                    )}
                  </div>

                  {commonAppEssay ? (
                    <EssayCard essay={commonAppEssay} />
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
                        )
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

            {region === "UK" && (
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
                        UK Personal Statements
                      </h2>
                      <p className="text-xs text-zinc-500">
                        UCAS personal statements & university-specific essays
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

                {ukEssays.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ukEssays.map((essay: any) => (
                      <EssayCard key={essay.id} essay={essay} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
                    <GraduationCapIcon className="size-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 mb-3">
                      No UK essays yet
                    </p>
                    <p className="text-xs text-zinc-400">
                      Add your UCAS personal statement or university-specific essays
                    </p>
                  </div>
                )}
              </div>
            )}

            {region === "Other" && (
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
                      Add essays for scholarships, Canada applications, or other programs
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
