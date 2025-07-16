export const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="h-10 w-32 bg-slate-100 rounded animate-pulse" />
    <div className="border rounded-md">
      <div className="h-10 bg-slate-50 border-b" />
      {[...Array(5)].map((_, idx) => (
        <div
          key={`skeleton-${idx}`}
          className="flex items-center space-x-4 p-4 border-b last:border-0"
        >
          <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-100 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
          </div>
          <div className="space-y-2 w-32">
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="space-y-2 w-48">
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);
