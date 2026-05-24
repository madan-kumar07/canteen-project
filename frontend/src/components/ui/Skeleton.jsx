import { cn } from '../../lib/utils';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg',
        'bg-surface-200 dark:bg-surface-800',
        className
      )}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s infinite linear, pulse 2s ease-in-out infinite',
      }}
      {...props}
    />
  );
}

export function FoodCardSkeleton() {
  return (
    <div className="card flex gap-4 p-4 h-36">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
      <Skeleton className="w-28 h-24 rounded-xl flex-shrink-0" />
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
