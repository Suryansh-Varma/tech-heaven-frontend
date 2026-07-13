'use client';

interface LoadingSkeletonProps {
  type: 'table' | 'card' | 'form' | 'stats';
}

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/3" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-full" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-10 bg-slate-50/70 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/4" />
        <div className="h-8 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-6 bg-slate-100 rounded-full w-6" />
            </div>
            <div className="h-7 bg-slate-100 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  // Form skeleton
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 animate-pulse">
      <div className="h-5 bg-slate-100 rounded w-1/4 mb-2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-9 bg-slate-50/80 rounded w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <div className="h-8 bg-slate-100 rounded w-20" />
        <div className="h-8 bg-slate-100 rounded w-24" />
      </div>
    </div>
  );
}
