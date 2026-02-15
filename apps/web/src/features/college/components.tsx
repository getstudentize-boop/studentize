import { useState } from "react";
import { CaretUp, CaretDown } from "@phosphor-icons/react";

// Collapsible Section Component
export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <span className="text-blue-700 font-medium">{title}</span>
        {isOpen ? (
          <CaretUp size={20} className="text-blue-600" />
        ) : (
          <CaretDown size={20} className="text-blue-600" />
        )}
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

// Progress Bar Component
export function ProgressBar({
  label,
  value,
  color,
  showPercentage = true,
}: {
  label: string;
  value: number;
  color: string;
  showPercentage?: boolean;
}) {
  const formattedValue = value.toFixed(1);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded ${color}`} />
        <span className="text-sm text-zinc-700">{label}</span>
      </div>
      <div className="relative h-8 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${color} rounded-full flex items-center justify-end pr-3 transition-all`}
          style={{ width: `${Math.max(value, 8)}%` }}
        >
          {showPercentage && value > 10 && (
            <span className="text-white text-sm font-medium">{formattedValue}%</span>
          )}
        </div>
        {showPercentage && value <= 10 && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
            style={{ color }}
          >
            {formattedValue}%
          </span>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
export function StatCard({
  label,
  value,
  valueColor = "text-blue-600",
}: {
  label: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div className="p-4 border border-zinc-200 rounded-lg">
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className={`text-lg font-semibold ${valueColor}`}>{value}</div>
    </div>
  );
}
