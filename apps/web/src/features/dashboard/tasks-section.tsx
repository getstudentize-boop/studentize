import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "orpc/client";
import { useAuthUser } from "@/routes/_authenticated";
import { SectionSkeleton } from "./section-skeleton";
import {
  CheckCircleIcon,
  CircleIcon,
  PlusIcon,
  XIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { format, isPast, isToday } from "date-fns";
import { useState } from "react";

// Task category config
const TASK_CATEGORIES = {
  profile_building: {
    label: "Profile Building",
    color: "bg-purple-100 text-purple-700",
  },
  essay_writing: { label: "Essay Writing", color: "bg-blue-100 text-blue-700" },
  university_research: {
    label: "University Research",
    color: "bg-green-100 text-green-700",
  },
  exams: { label: "Exams", color: "bg-orange-100 text-orange-700" },
  sat_act: { label: "SAT/ACT", color: "bg-amber-100 text-amber-700" },
  other: { label: "Other", color: "bg-zinc-100 text-zinc-700" },
} as const;

type TaskCategory = keyof typeof TASK_CATEGORIES;
type TaskPriority = "low" | "medium" | "high";

export function TasksSection() {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "completed">(
    "all",
  );

  const taskQueryOptions = orpc.task.list.queryOptions({ input: {} });
  const tasksQuery = useQuery({
    ...taskQueryOptions,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

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

      queryClient.setQueryData(
        taskQueryOptions.queryKey,
        (old: any[] | undefined) => {
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
        },
      );

      setShowCreateModal(false);
      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      queryClient.setQueryData(
        taskQueryOptions.queryKey,
        context?.previousTasks,
      );
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

      queryClient.setQueryData(
        taskQueryOptions.queryKey,
        (old: any[] | undefined) => {
          return (old || []).map((task) =>
            task.id === updatedTask.taskId
              ? {
                  ...task,
                  ...updatedTask,
                  updatedAt: new Date().toISOString(),
                  completedAt:
                    updatedTask.status === "completed"
                      ? new Date().toISOString()
                      : task.completedAt,
                }
              : task,
          );
        },
      );

      setEditingTask(null);
      return { previousTasks };
    },
    onError: (_err, _updatedTask, context) => {
      queryClient.setQueryData(
        taskQueryOptions.queryKey,
        context?.previousTasks,
      );
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

      queryClient.setQueryData(
        taskQueryOptions.queryKey,
        (old: any[] | undefined) => {
          return (old || []).filter((task) => task.id !== taskId);
        },
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(
        taskQueryOptions.queryKey,
        context?.previousTasks,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryOptions.queryKey });
    },
  });

  const tasks = tasksQuery.data ?? [];

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "pending") return task.status !== "completed";
    if (taskFilter === "completed") return task.status === "completed";
    return true;
  });

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

  if (tasksQuery.isLoading) {
    return (
      <div className="lg:col-span-2 flex flex-col">
        <SectionSkeleton className="flex-1" />
      </div>
    );
  }

  return (
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
          <div className="grid grid-cols-[24px_1fr_100px_80px_70px_70px_28px] gap-3 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 text-xs font-medium text-zinc-500 uppercase tracking-wide">
            <div></div>
            <div>Task</div>
            <div>Category</div>
            <div>Assigned</div>
            <div>Priority</div>
            <div>Due</div>
            <div></div>
          </div>
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

      {(showCreateModal || editingTask) && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTask(null);
          }}
          onSubmit={(data) => {
            if (editingTask) {
              updateTaskMutation.mutate({
                taskId: editingTask.id,
                ...data,
              });
            } else {
              createTaskMutation.mutate(data);
            }
          }}
          isLoading={
            createTaskMutation.isPending || updateTaskMutation.isPending
          }
        />
      )}
    </div>
  );
}

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
  const displayCategory =
    task.category === "other" && task.customCategory
      ? task.customCategory
      : categoryConfig?.label || task.category;

  const isSelfAssigned = task.studentUserId === task.assignedByUserId;
  const assignedByLabel = isSelfAssigned
    ? "You"
    : task.assignedByName || "Advisor";

  const getDueDateStyle = () => {
    if (!task.dueDate || isCompleted) return "text-zinc-400";
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) return "text-red-500 font-medium";
    if (isToday(dueDate)) return "text-orange-500 font-medium";
    return "text-zinc-600";
  };

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

      <div className={`text-xs truncate ${isCompleted ? "text-zinc-400" : ""}`}>
        <span
          className={
            isSelfAssigned ? "text-zinc-500" : "text-indigo-600 font-medium"
          }
        >
          {assignedByLabel}
        </span>
      </div>

      <div>
        <span
          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getPriorityBadge()}`}
        >
          {getPriorityLabel()}
        </span>
      </div>

      <div className={`text-xs ${getDueDateStyle()}`}>
        {task.dueDate
          ? isToday(new Date(task.dueDate))
            ? "Today"
            : format(new Date(task.dueDate), "MMM d")
          : "\u2014"}
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
    task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
  );
  const [category, setCategory] = useState<TaskCategory>(
    task?.category || "other",
  );
  const [customCategory, setCustomCategory] = useState(
    task?.customCategory || "",
  );
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "medium",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      category,
      customCategory:
        category === "other" ? customCategory.trim() || undefined : undefined,
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
