import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc, client } from "orpc/client";
import { useAuthUser } from "@/routes/_authenticated";
import { UpgradeModal, LockedOverlay } from "@/components/upgrade-modal";
import { PageLoader } from "@/components/page-loader";
import {
  BrainIcon,
  ChalkboardTeacherIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  PencilIcon,
  ChartLineIcon,
  HeadsetIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  CircleIcon,
  PlusIcon,
  XIcon,
  CalendarIcon,
  TrashIcon,
  PencilSimpleIcon,
  DotsThreeIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { format, isPast, isToday } from "date-fns";
import { useState, useRef, useLayoutEffect } from "react";

export const Route = createFileRoute("/_authenticated/student/dashboard")({
  component: RouteComponent,
});

// Task category config
const TASK_CATEGORIES = {
  profile_building: { label: "Profile Building", color: "bg-purple-100 text-purple-700" },
  essay_writing: { label: "Essay Writing", color: "bg-blue-100 text-blue-700" },
  university_research: { label: "University Research", color: "bg-green-100 text-green-700" },
  exams: { label: "Exams", color: "bg-orange-100 text-orange-700" },
  sat_act: { label: "SAT/ACT", color: "bg-amber-100 text-amber-700" },
  other: { label: "Other", color: "bg-zinc-100 text-zinc-700" },
} as const;

type TaskCategory = keyof typeof TASK_CATEGORIES;
type TaskPriority = "low" | "medium" | "high";

function RouteComponent() {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "completed">("all");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  // Fetch student profile to check tier
  const profileQuery = useQuery(
    orpc.student.getMyProfile.queryOptions({ input: {} })
  );
  const isFreeUser = !profileQuery.data?.tier || profileQuery.data.tier === "FREE";

  // Fetch assigned advisor info
  const advisorQuery = useQuery(
    orpc.student.getMyAdvisor.queryOptions({ input: {} })
  );

  // Fetch recent sessions
  const sessionsQuery = useQuery(
    orpc.student.getMySessions.queryOptions({ input: {} })
  );

  // Fetch tasks with caching for snappy experience
  const taskQueryOptions = orpc.task.list.queryOptions({ input: {} });
  const tasksQuery = useQuery({
    ...taskQueryOptions,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Task mutations with optimistic updates
  const createTaskMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      dueDate?: string;
      category: TaskCategory;
      customCategory?: string;
      priority: TaskPriority;
    }) => {
      return await client.task.create(data);
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: taskQueryOptions.queryKey });
      const previousTasks = queryClient.getQueryData(taskQueryOptions.queryKey);

      // Optimistically add the new task
      queryClient.setQueryData(taskQueryOptions.queryKey, (old: any[] | undefined) => {
        const optimisticTask = {
          id: `temp-${Date.now()}`,
          ...newTask,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          studentUserId: user?.id,
          assignedByUserId: user?.id,
          completedAt: null,
        };
        return [optimisticTask, ...(old || [])];
      });

      setShowCreateModal(false);
      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      queryClient.setQueryData(taskQueryOptions.queryKey, context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryOptions.queryKey });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: {
      taskId: string;
      title?: string;
      description?: string | null;
      dueDate?: string | null;
      status?: "pending" | "in_progress" | "completed";
      priority?: TaskPriority;
      category?: TaskCategory;
      customCategory?: string | null;
    }) => {
      return await client.task.update(data);
    },
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: taskQueryOptions.queryKey });
      const previousTasks = queryClient.getQueryData(taskQueryOptions.queryKey);

      // Optimistically update the task
      queryClient.setQueryData(taskQueryOptions.queryKey, (old: any[] | undefined) => {
        return (old || []).map((task) =>
          task.id === updatedTask.taskId
            ? {
                ...task,
                ...updatedTask,
                updatedAt: new Date().toISOString(),
                completedAt: updatedTask.status === "completed" ? new Date().toISOString() : task.completedAt,
              }
            : task
        );
      });

      setEditingTask(null);
      return { previousTasks };
    },
    onError: (_err, _updatedTask, context) => {
      queryClient.setQueryData(taskQueryOptions.queryKey, context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryOptions.queryKey });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (data: { taskId: string }) => {
      return await client.task.delete(data);
    },
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: taskQueryOptions.queryKey });
      const previousTasks = queryClient.getQueryData(taskQueryOptions.queryKey);

      // Optimistically remove the task
      queryClient.setQueryData(taskQueryOptions.queryKey, (old: any[] | undefined) => {
        return (old || []).filter((task) => task.id !== taskId);
      });

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(taskQueryOptions.queryKey, context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryOptions.queryKey });
    },
  });

  // Scores
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
        queryClient.invalidateQueries({ queryKey: scoreQueryOptions.queryKey });
        setShowScoreModal(false);
      },
    })
  );

  const deleteScoreMutation = useMutation(
    orpc.score.delete.mutationOptions({
      onMutate: async ({ scoreId }) => {
        await queryClient.cancelQueries({ queryKey: scoreQueryOptions.queryKey });
        const previous = queryClient.getQueryData(scoreQueryOptions.queryKey);
        queryClient.setQueryData(scoreQueryOptions.queryKey, (old: any[] | undefined) =>
          (old || []).filter((s) => s.id !== scoreId)
        );
        return { previous };
      },
      onError: (_err, _vars, context) => {
        queryClient.setQueryData(scoreQueryOptions.queryKey, context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: scoreQueryOptions.queryKey });
      },
    })
  );

  const advisor = advisorQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const recentSessions = sessions.slice(0, 3);
  const tasks = tasksQuery.data ?? [];
  const scores = scoresQuery.data ?? [];

  // Check if all essential data is loading
  const isPageLoading = profileQuery.isLoading || advisorQuery.isLoading || sessionsQuery.isLoading || tasksQuery.isLoading || scoresQuery.isLoading;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "pending") return task.status !== "completed";
    if (taskFilter === "completed") return task.status === "completed";
    return true;
  });

  // Sort: pending tasks by due date, then completed at bottom
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  // Show loading state until all data is ready
  if (isPageLoading) {
    return <PageLoader message="Loading your dashboard..." />;
  }

  return (
    <div className="flex flex-1 h-screen text-left bg-zinc-50">
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="px-8 pt-12 pb-8 bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-zinc-500 mt-2">
              Your personalized college application workspace
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8 max-w-7xl w-full mx-auto">
          {/* Top Row: Quick Actions + My Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column: Quick Actions */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Quick Actions
              </h2>
              <Link
                to="/guru"
                className="block bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.01] transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <BrainIcon className="size-8" weight="duotone" />
                  <ArrowRightIcon className="size-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-semibold text-lg mb-0.5">Chat with Guru</div>
                <div className="text-blue-100 text-sm">
                  AI-powered guidance for applications
                </div>
              </Link>

              <Link
                to="/student/universities/explorer"
                className="block bg-white rounded-xl p-5 border-2 border-zinc-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GraduationCapIcon className="size-6 text-blue-600" weight="duotone" />
                  </div>
                  <ArrowRightIcon className="size-5 text-zinc-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                </div>
                <div className="font-semibold text-zinc-900 mb-0.5">
                  Explore Universities
                </div>
                <div className="text-zinc-600 text-sm">
                  Discover US and UK universities
                </div>
              </Link>
            </div>

            {/* Right Column: My Tasks */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-zinc-900">My Tasks</h2>
                  <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
                    {(["all", "pending", "completed"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTaskFilter(filter)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          taskFilter === filter
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        {filter === "all"
                          ? `All (${tasks.length})`
                          : filter === "pending"
                          ? `Pending (${pendingCount})`
                          : `Completed (${completedCount})`}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="size-4" weight="bold" />
                  Add Task
                </button>
              </div>

              {sortedTasks.length > 0 ? (
                <div className="bg-white rounded-xl border border-zinc-200 flex-1 overflow-hidden flex flex-col">
                  {/* Table Header */}
                  <div className="grid grid-cols-[24px_1fr_100px_80px_70px_70px_28px] gap-3 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    <div></div>
                    <div>Task</div>
                    <div>Category</div>
                    <div>Assigned</div>
                    <div>Priority</div>
                    <div>Due</div>
                    <div></div>
                  </div>
                  {/* Table Body */}
                  <div className="overflow-y-auto max-h-[240px]">
                    {sortedTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggleComplete={(id, completed) => {
                          updateTaskMutation.mutate({
                            taskId: id,
                            status: completed ? "completed" : "pending",
                          });
                        }}
                        onEdit={(task) => setEditingTask(task)}
                        onDelete={(id) => deleteTaskMutation.mutate({ taskId: id })}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center flex-1 flex flex-col items-center justify-center">
                  <CheckCircleIcon
                    className="size-10 text-zinc-300 mb-3"
                    weight="duotone"
                  />
                  <p className="text-zinc-900 font-medium mb-1">
                    {taskFilter === "completed"
                      ? "No completed tasks yet"
                      : taskFilter === "pending"
                      ? "All caught up!"
                      : "No tasks yet"}
                  </p>
                  <p className="text-sm text-zinc-500 mb-3">
                    {taskFilter === "all"
                      ? "Add your first task to start tracking your progress"
                      : taskFilter === "pending"
                      ? "You've completed all your tasks"
                      : "Complete some tasks to see them here"}
                  </p>
                  {taskFilter === "all" && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="size-4" weight="bold" />
                      Add Task
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info Cards Row - Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Advisor Card */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 relative">
              {isFreeUser && (
                <LockedOverlay
                  onClick={() => {
                    setUpgradeFeature("your personal advisor");
                    setShowUpgradeModal(true);
                  }}
                  message="Advisor Access"
                />
              )}
              <div className="flex items-center gap-2 mb-2">
                <ChalkboardTeacherIcon className="size-5 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                  Your Advisor
                </span>
              </div>
              {advisor ? (
                <div className="text-lg font-semibold text-zinc-900">
                  {advisor.advisorName}
                </div>
              ) : (
                <div className="text-zinc-400">Not assigned yet</div>
              )}
            </div>

            {/* Profile Card */}
            <Link
              to="/student/profile"
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-100 rounded-lg">
                    <UserIcon className="size-5 text-zinc-600" weight="duotone" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-0.5">
                      Your Profile
                    </div>
                    <div className="text-lg font-semibold text-zinc-900">
                      {user?.name || user?.email || "Student"}
                    </div>
                  </div>
                </div>
                <ArrowRightIcon className="size-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Recent Sessions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Recent Sessions
              </h2>
              {sessions.length > 3 && !isFreeUser && (
                <Link
                  to="/student/sessions"
                  className="text-sm text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 group"
                >
                  View all
                  <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {isFreeUser ? (
              <div className="bg-white rounded-xl border border-zinc-200 relative overflow-hidden">
                {/* Blurred placeholder sessions */}
                <div className="filter blur-sm pointer-events-none select-none p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-zinc-50 rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <HeadsetIcon className="size-6 text-zinc-300" weight="duotone" />
                        </div>
                        <div className="h-4 bg-zinc-200 rounded mb-2 w-3/4" />
                        <div className="h-3 bg-zinc-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultation placard overlay */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center px-6 text-center">
                  <div className="p-3 bg-blue-50 rounded-full mb-3">
                    <CalendarIcon className="size-7 text-blue-600" weight="duotone" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                    Book Your Free 1-on-1 Consultation
                  </h3>
                  <p className="text-sm text-zinc-500 max-w-sm mb-4">
                    Get personalized guidance from the Studentize team to kickstart your college application journey.
                  </p>
                  <a
                    href="https://calendly.com/team-studentize/new-meeting"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CalendarIcon className="size-4" weight="bold" />
                    Schedule Free Consultation
                  </a>
                </div>
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    to="/student/sessions/$sessionId"
                    params={{ sessionId: session.id }}
                    className="block bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <HeadsetIcon className="size-6 text-zinc-400" weight="duotone" />
                      <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="font-medium text-zinc-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <ClockIcon className="size-3.5" />
                      {format(
                        new Date(session.createdAt ?? new Date()),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
                <HeadsetIcon className="size-10 text-zinc-300 mx-auto mb-3" weight="duotone" />
                <p className="text-zinc-900 font-medium mb-1">
                  No sessions yet
                </p>
                <p className="text-sm text-zinc-500">
                  Your sessions with your advisor will appear here
                </p>
              </div>
            )}
          </div>

          {/* Scores Section */}
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
                {/* Score Chart */}
                <ScoreChart scores={scores} />

                {/* Score List */}
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
                        onDelete={(id) => deleteScoreMutation.mutate({ scoreId: id })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
                <TrophyIcon className="size-10 text-zinc-300 mx-auto mb-3" weight="duotone" />
                <p className="text-zinc-900 font-medium mb-1">No scores logged yet</p>
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
          </div>

          {/* Score Modal */}
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

          {/* Create/Edit Task Modal */}
          {(showCreateModal || editingTask) && (
            <TaskModal
              task={editingTask}
              onClose={() => {
                setShowCreateModal(false);
                setEditingTask(null);
              }}
              onSubmit={(data) => {
                if (editingTask) {
                  updateTaskMutation.mutate({ taskId: editingTask.id, ...data });
                } else {
                  createTaskMutation.mutate(data);
                }
              }}
              isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
            />
          )}

          {/* Upgrade Modal */}
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            featureName={upgradeFeature}
          />

          {/* All Tools */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              All Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* University Explorer - Already featured above, so minimal here */}
              <Link
                to="/student/universities/explorer"
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GraduationCapIcon className="size-5 text-blue-600" weight="duotone" />
                  </div>
                  <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  University Explorer
                </h3>
                <p className="text-zinc-600 text-sm">
                  Browse US & UK universities
                </p>
              </Link>

              {/* Essay Writing */}
              <Link
                to="/essays"
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <PencilIcon className="size-5 text-purple-600" weight="duotone" />
                  </div>
                  <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Essay Writing
                </h3>
                <p className="text-zinc-600 text-sm">
                  Draft your college essays
                </p>
              </Link>

              {/* Aptitude Test */}
              <Link
                to="/student/aptitude"
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <ChartLineIcon className="size-5 text-amber-600" weight="duotone" />
                  </div>
                  <ArrowRightIcon className="size-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">
                  Aptitude Test
                </h3>
                <p className="text-zinc-600 text-sm">
                  Discover your career path
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// TaskRow Component - Table-based layout
function TaskRow({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  task: any;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const isCompleted = task.status === "completed";
  const categoryConfig = TASK_CATEGORIES[task.category as TaskCategory];
  const displayCategory = task.category === "other" && task.customCategory
    ? task.customCategory
    : categoryConfig?.label || task.category;

  // Determine who assigned the task
  const isSelfAssigned = task.studentUserId === task.assignedByUserId;
  const assignedByLabel = isSelfAssigned ? "You" : task.assignedByName || "Advisor";

  // Due date styling
  const getDueDateStyle = () => {
    if (!task.dueDate || isCompleted) return "text-zinc-400";
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) return "text-red-500 font-medium";
    if (isToday(dueDate)) return "text-orange-500 font-medium";
    return "text-zinc-600";
  };

  // Priority badge styling
  const getPriorityBadge = () => {
    if (isCompleted) return "bg-zinc-100 text-zinc-400";
    switch (task.priority) {
      case "high":
        return "bg-red-50 text-red-600";
      case "medium":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-zinc-100 text-zinc-500";
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case "high":
        return "High";
      case "medium":
        return "Med";
      default:
        return "Low";
    }
  };

  return (
    <div
      className={`grid grid-cols-[24px_1fr_100px_80px_70px_70px_28px] gap-3 px-4 py-3 items-center hover:bg-zinc-50 transition-colors group border-b border-zinc-100 last:border-b-0 ${
        isCompleted ? "bg-zinc-50/50" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleComplete(task.id, !isCompleted)}
        className="flex-shrink-0"
      >
        {isCompleted ? (
          <CheckCircleIcon className="size-5 text-blue-500" weight="fill" />
        ) : (
          <CircleIcon className="size-5 text-zinc-300 hover:text-blue-400 transition-colors" />
        )}
      </button>

      {/* Task Title & Description */}
      <div className="min-w-0">
        <div
          className={`font-medium text-sm ${
            isCompleted ? "line-through text-zinc-400" : "text-zinc-900"
          }`}
        >
          {task.title}
        </div>
        {task.description && (
          <div
            className={`text-xs truncate mt-0.5 ${isCompleted ? "text-zinc-400" : "text-zinc-500"}`}
            title={task.description}
          >
            {task.description}
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <span
          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full truncate max-w-full ${
            task.category === "other"
              ? "bg-zinc-100 text-zinc-600"
              : categoryConfig?.color || "bg-zinc-100 text-zinc-600"
          }`}
          title={displayCategory}
        >
          {displayCategory}
        </span>
      </div>

      {/* Assigned By */}
      <div className={`text-xs truncate ${isCompleted ? "text-zinc-400" : ""}`}>
        <span className={isSelfAssigned ? "text-zinc-500" : "text-indigo-600 font-medium"}>
          {assignedByLabel}
        </span>
      </div>

      {/* Priority */}
      <div>
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getPriorityBadge()}`}>
          {getPriorityLabel()}
        </span>
      </div>

      {/* Due Date */}
      <div className={`text-xs ${getDueDateStyle()}`}>
        {task.dueDate ? (
          isToday(new Date(task.dueDate))
            ? "Today"
            : format(new Date(task.dueDate), "MMM d")
        ) : (
          "—"
        )}
      </div>

      {/* Actions Menu */}
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
                  onEdit(task);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
              >
                <PencilSimpleIcon className="size-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
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

// TaskModal Component
function TaskModal({
  task,
  onClose,
  onSubmit,
  isLoading,
}: {
  task?: any;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    category: TaskCategory;
    customCategory?: string;
    priority: TaskPriority;
  }) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
  );
  const [category, setCategory] = useState<TaskCategory>(
    task?.category || "other"
  );
  const [customCategory, setCustomCategory] = useState(task?.customCategory || "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      category,
      customCategory: category === "other" ? customCategory.trim() || undefined : undefined,
      priority,
    });
  };

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
            {task ? "Edit Task" : "Add Task"}
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to do?"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={2}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.entries(TASK_CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Category (shown when "other" is selected) */}
            {category === "other" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Custom Category Name
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter category name..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Priority
              </label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      priority === p
                        ? p === "high"
                          ? "bg-red-50 border-red-300 text-red-700"
                          : p === "medium"
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-zinc-100 border-zinc-300 text-zinc-700"
                        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
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
              disabled={!title.trim() || isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Saving..." : task ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

// ScoreChart - simple line visualization of scores over time per subject
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

  // Group scores by subject
  const subjectMap = new Map<string, any[]>();
  for (const s of scores) {
    const list = subjectMap.get(s.subject) || [];
    list.push(s);
    subjectMap.set(s.subject, list);
  }

  // Sort each subject's scores by date (ascending for chart)
  const subjects = Array.from(subjectMap.entries()).map(([name, entries]) => ({
    name,
    entries: [...entries].sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    ),
  }));

  if (subjects.length === 0) return null;

  const chartHeight = 160;
  // Match viewBox width to container pixels so SVG scales uniformly (circles stay round).
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
            <span className="text-xs text-zinc-600 font-medium">{subj.name}</span>
          </div>
        ))}
      </div>

      <div ref={containerRef} className="relative" style={{ height: chartHeight }}>
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <div
            key={pct}
            className="absolute right-0 border-t border-zinc-100"
            style={{ top: padding.top + plotHeight * (1 - pct / 100), left: padding.left }}
          >
            <span className="absolute -top-2 text-[10px] text-zinc-400" style={{ right: `calc(100% + 4px)` }}>
              {pct}%
            </span>
          </div>
        ))}

        {/* SVG for lines and dots */}
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
                      {subj.name}: {p.entry.score}/{p.entry.maxScore} ({Math.round(p.pct)}%) —{" "}
                      {format(new Date(p.entry.examDate), "MMM d, yyyy")}
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>

        {/* X-axis date labels */}
        {subjects.length > 0 && (
          <div
            className="absolute right-0 flex justify-between"
            style={{ top: chartHeight - padding.bottom + 6, left: padding.left }}
          >
            {(() => {
              // Collect all dates, sort, show first and last
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

// ScoreRow Component
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

// ScoreModal Component
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
  const [maxScore, setMaxScore] = useState(score?.maxScore?.toString() || "100");
  const [examDate, setExamDate] = useState(
    score?.examDate ? format(new Date(score.examDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
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
            {/* Subject */}
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

            {/* Score & Max Score */}
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

            {/* Exam Date */}
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

            {/* Notes */}
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

          {/* Actions */}
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
              disabled={!subject.trim() || !scoreValue || !maxScore || isLoading}
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
