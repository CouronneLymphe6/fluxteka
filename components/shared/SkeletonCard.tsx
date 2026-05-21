export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-white p-5 space-y-3">
      {/* Status badge */}
      <div className="flex justify-between">
        <div className="h-5 w-16 rounded-full animate-shimmer" />
        <div className="h-4 w-12 rounded animate-shimmer" />
      </div>
      {/* Title */}
      <div className="h-6 w-3/4 rounded animate-shimmer" />
      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full animate-shimmer" />
        <div className="h-4 w-24 rounded animate-shimmer" />
      </div>
      {/* Score */}
      <div className="h-7 w-28 rounded-lg animate-shimmer" />
      {/* Description */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded animate-shimmer" />
        <div className="h-3.5 w-full rounded animate-shimmer" />
        <div className="h-3.5 w-2/3 rounded animate-shimmer" />
      </div>
      {/* Tags */}
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-md animate-shimmer" />
        <div className="h-5 w-16 rounded-md animate-shimmer" />
        <div className="h-5 w-12 rounded-md animate-shimmer" />
      </div>
      {/* Action */}
      <div className="border-t border-border pt-3">
        <div className="h-4 w-32 rounded animate-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
