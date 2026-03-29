import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { SectionSkeleton } from "./section-skeleton";
import {
  PlusIcon,
  XIcon,
  DotsThreeIcon,
  TrashIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState, useRef, useLayoutEffect } from "react";

// Subject color mapping for the chart
const SUBJECT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f97316", // orange
];

function getSubjectColor(index: number) {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

export function ScoresSection() {
  const queryClient = useQueryClient();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editingScore, setEditingScore] = useState<any>(null);

  const scoreQueryOptions = orpc.score.list.queryOptions({ input: {} });
  const scoresQuery = useQuery({
    ...scoreQueryOptions,
    staleTime: 1000 * 60 * 5,
  });

  const createScoreMutation = useMutation(
    orpc.score.create.mutationOptions({
      onSuccess: () => {
        setShowScoreModal(false);
        return queryClient.invalidateQueries({
          queryKey: scoreQueryOptions.queryKey,
        });
      },
    }),
  );

  const deleteScoreMutation = useMutation(
    orpc.score.delete.mutationOptions({
      onMutate: async ({ scoreId }) => {
        await queryClient.cancelQueries({
          queryKey: scoreQueryOptions.queryKey,
        });
        const previous = queryClient.getQueryData(scoreQueryOptions.queryKey);
        queryClient.setQueryData(
          scoreQueryOptions.queryKey,
          (old: any[] | undefined) =>
            (old || []).filter((s) => s.id !== scoreId),
        );
        return { previous };
      },
      onError: (_err, _vars, context) => {
        queryClient.setQueryData(scoreQueryOptions.queryKey, context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: scoreQueryOptions.queryKey });
      },
    }),
  );

  const scores = scoresQuery.data ?? [];

  if (scoresQuery.isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Scores</h2>
        <SectionSkeleton />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">Scores</h2>
        <button
          onClick={() => {
            setEditingScore(null);
            setShowScoreModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="size-4" weight="bold" />
          Log Score
        </button>
      </div>

      {scores.length > 0 ? (
        <div className="space-y-6">
          <ScoreChart scores={scores} />

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_80px_90px_28px] gap-3 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 text-xs font-medium text-zinc-500 uppercase tracking-wide">
              <div>Subject</div>
              <div>Score</div>
              <div>%</div>
              <div>Date</div>
              <div></div>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {scores.map((score) => (
                <ScoreRow
                  key={score.id}
                  score={score}
                  onDelete={(id) =>
                    deleteScoreMutation.mutate({ scoreId: id })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
          <TrophyIcon
            className="size-10 text-zinc-300 mx-auto mb-3"
            weight="duotone"
          />
          <p className="text-zinc-900 font-medium mb-1">
            No scores logged yet
          </p>
          <p className="text-sm text-zinc-500 mb-3">
            Track your test scores and academic progress over time
          </p>
          <button
            onClick={() => setShowScoreModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="size-4" weight="bold" />
            Log Your First Score
          </button>
        </div>
      )}

      {showScoreModal && (
        <ScoreModal
          score={editingScore}
          onClose={() => {
            setShowScoreModal(false);
            setEditingScore(null);
          }}
          onSubmit={(data) => createScoreMutation.mutate(data)}
          isLoading={createScoreMutation.isPending}
        />
      )}
    </div>
  );
}

function ScoreChart({ scores }: { scores: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w != null && w > 0) setSvgWidth(Math.round(w));
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) setSvgWidth(Math.round(rect.width));
    return () => ro.disconnect();
  }, []);

  const subjectMap = new Map<string, any[]>();
  for (const s of scores) {
    const list = subjectMap.get(s.subject) || [];
    list.push(s);
    subjectMap.set(s.subject, list);
  }

  const subjects = Array.from(subjectMap.entries()).map(([name, entries]) => ({
    name,
    entries: [...entries].sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
    ),
  }));

  if (subjects.length === 0) return null;

  const chartHeight = 160;
  const plotWidth = Math.max(svgWidth, 100);
  const padding = { top: 10, bottom: 24, left: 38, right: 10 };
  const plotHeight = chartHeight - padding.top - padding.bottom;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {subjects.map((subj, i) => (
          <div key={subj.name} className="flex items-center gap-1.5">
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: getSubjectColor(i) }}
            />
            <span className="text-xs text-zinc-600 font-medium">
              {subj.name}
            </span>
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative"
        style={{ height: chartHeight }}
      >
        {[0, 25, 50, 75, 100].map((pct) => (
          <div
            key={pct}
            className="absolute right-0 border-t border-zinc-100"
            style={{
              top: padding.top + plotHeight * (1 - pct / 100),
              left: padding.left,
            }}
          >
            <span
              className="absolute -top-2 text-[10px] text-zinc-400"
              style={{ right: `calc(100% + 4px)` }}
            >
              {pct}%
            </span>
          </div>
        ))}

        <svg
          className="absolute inset-0"
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${plotWidth} ${chartHeight}`}
        >
          {subjects.map((subj, si) => {
            const points = subj.entries.map((entry, ei) => {
              const x =
                subj.entries.length === 1
                  ? plotWidth / 2
                  : padding.left +
                    (ei / (subj.entries.length - 1)) *
                      (plotWidth - padding.left - padding.right);
              const pct = (entry.score / entry.maxScore) * 100;
              const y = padding.top + plotHeight * (1 - pct / 100);
              return { x, y, pct, entry };
            });

            const linePath = points
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ");

            return (
              <g key={subj.name}>
                {points.length > 1 && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={getSubjectColor(si)}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {points.map((p, pi) => (
                  <circle
                    key={pi}
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="white"
                    stroke={getSubjectColor(si)}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  >
                    <title>
                      {subj.name}: {p.entry.score}/{p.entry.maxScore} (
                      {Math.round(p.pct)}%) —{" "}
                      {format(new Date(p.entry.examDate), "MMM d, yyyy")}
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>

        {subjects.length > 0 && (
          <div
            className="absolute right-0 flex justify-between"
            style={{
              top: chartHeight - padding.bottom + 6,
              left: padding.left,
            }}
          >
            {(() => {
              const allDates = scores
                .map((s) => new Date(s.examDate).getTime())
                .sort((a, b) => a - b);
              const first = allDates[0];
              const last = allDates[allDates.length - 1];
              if (!first) return null;
              return (
                <>
                  <span className="text-[10px] text-zinc-400">
                    {format(new Date(first), "MMM d")}
                  </span>
                  {first !== last && (
                    <span className="text-[10px] text-zinc-400">
                      {format(new Date(last), "MMM d")}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreRow({
  score,
  onDelete,
}: {
  score: any;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const pct = Math.round((score.score / score.maxScore) * 100);

  const getPctColor = () => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="grid grid-cols-[1fr_80px_80px_90px_28px] gap-3 px-4 py-3 items-center hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0">
      <div className="font-medium text-sm text-zinc-900 truncate">
        {score.subject}
        {score.notes && (
          <span className="text-xs text-zinc-400 ml-1.5" title={score.notes}>
            — {score.notes}
          </span>
        )}
      </div>
      <div className="text-sm text-zinc-700">
        {score.score}/{score.maxScore}
      </div>
      <div className={`text-sm font-medium ${getPctColor()}`}>{pct}%</div>
      <div className="text-xs text-zinc-500">
        {format(new Date(score.examDate), "MMM d, yy")}
      </div>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
        >
          <DotsThreeIcon className="size-4" weight="bold" />
        </button>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 min-w-[100px]">
              <button
                onClick={() => {
                  onDelete(score.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <TrashIcon className="size-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreModal({
  score,
  onClose,
  onSubmit,
  isLoading,
}: {
  score?: any;
  onClose: () => void;
  onSubmit: (data: {
    subject: string;
    score: number;
    maxScore: number;
    examDate: string;
    notes?: string;
  }) => void;
  isLoading: boolean;
}) {
  const [subject, setSubject] = useState(score?.subject || "");
  const [scoreValue, setScoreValue] = useState(score?.score?.toString() || "");
  const [maxScore, setMaxScore] = useState(
    score?.maxScore?.toString() || "100",
  );
  const [examDate, setExamDate] = useState(
    score?.examDate
      ? format(new Date(score.examDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
  );
  const [notes, setNotes] = useState(score?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !scoreValue || !maxScore) return;

    onSubmit({
      subject: subject.trim(),
      score: parseFloat(scoreValue),
      maxScore: parseFloat(maxScore),
      examDate: new Date(examDate).toISOString(),
      notes: notes.trim() || undefined,
    });
  };

  const COMMON_SUBJECTS = [
    "Mathematics",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "SAT",
    "ACT",
    "IELTS",
    "TOEFL",
    "AP Calculus",
    "AP Physics",
    "AP Chemistry",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 rounded"
        >
          <XIcon className="size-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            {score ? "Edit Score" : "Log Score"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, SAT, IELTS"
                list="common-subjects"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <datalist id="common-subjects">
                {COMMON_SUBJECTS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Score <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                  placeholder="85"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Max Score <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  placeholder="100"
                  min="1"
                  step="any"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Mid-term exam, Mock test"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !subject.trim() || !scoreValue || !maxScore || isLoading
              }
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Saving..." : "Log Score"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
