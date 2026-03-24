import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/dialog";
import { cn } from "@/utils/cn";
import {
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react";
import type { ShortlistUniversity } from "@/hooks/use-webrtc";

const categoryConfig = {
  reach: {
    label: "Reach",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    icon: WarningCircleIcon,
  },
  target: {
    label: "Target",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: CheckCircleIcon,
  },
  safety: {
    label: "Safety",
    color: "text-green-700 bg-green-50 border-green-200",
    icon: CheckCircleIcon,
  },
};

export function ShortlistConfirmationDialog({
  universities,
  isOpen,
  onConfirm,
  onCancel,
  isSaving,
  error,
}: {
  universities: ShortlistUniversity[];
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const grouped = {
    reach: universities.filter((u) => u.category === "reach"),
    target: universities.filter((u) => u.category === "target"),
    safety: universities.filter((u) => u.category === "safety"),
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCapIcon className="size-5 text-zinc-700" weight="fill" />
            <DialogTitle>Your University Shortlist</DialogTitle>
          </div>
          <DialogDescription>
            Review your shortlist below. Confirming will save it to your profile
            (replacing any previous AI-generated shortlist).
          </DialogDescription>

          <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
            {(["reach", "target", "safety"] as const).map((cat) => {
              const items = grouped[cat];
              if (items.length === 0) return null;
              const config = categoryConfig[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <config.icon
                      className={cn("size-4", config.color.split(" ")[0])}
                      weight="fill"
                    />
                    <span className="text-sm font-medium text-zinc-800">
                      {config.label} ({items.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map((u, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-zinc-900">
                            {u.name}
                          </span>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full border font-medium shrink-0",
                              config.color
                            )}
                          >
                            {config.label}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {u.country.toUpperCase()}
                        </div>
                        {u.notes && (
                          <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                            {u.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <XCircleIcon className="size-4 shrink-0" weight="fill" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  );
}
