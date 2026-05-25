export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
        <div className="h-4 w-96 bg-slate-100 dark:bg-slate-900 rounded-md" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registry Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Logs Skeleton */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="h-5 w-40 bg-slate-800 rounded mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 w-full bg-slate-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}