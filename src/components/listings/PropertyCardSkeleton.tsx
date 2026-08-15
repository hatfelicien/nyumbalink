import { Skeleton } from '../ui/Skeleton'

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-700/10 bg-white dark:border-navy-700 dark:bg-navy-800">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
    </div>
  )
}
