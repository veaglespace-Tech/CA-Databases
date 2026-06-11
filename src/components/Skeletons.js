export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
