export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-2/5 rounded bg-muted" />
            <div className="h-2.5 w-1/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="h-3 w-2/3 rounded bg-muted" />
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  );
}
