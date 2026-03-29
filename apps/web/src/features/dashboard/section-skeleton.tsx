export function SectionSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-zinc-200 p-6 animate-pulse ${className}`}>
      <div className="h-5 bg-zinc-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-zinc-100 rounded w-full" />
        <div className="h-4 bg-zinc-100 rounded w-2/3" />
        <div className="h-4 bg-zinc-100 rounded w-1/2" />
      </div>
    </div>
  );
}
