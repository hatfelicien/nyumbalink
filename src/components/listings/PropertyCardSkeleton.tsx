import { Skeleton } from '../ui/Skeleton'

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-700/10 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="h-3 w-1/2" />
        <Skeleton variant="text" className="mt-4 h-5 w-2/5" />
        <div className="flex gap-4 border-t border-navy-700/10 pt-3 dark:border-navy-700">
          <Skeleton variant="text" className="h-3 w-8" />
          <Skeleton variant="text" className="h-3 w-8" />
          <Skeleton variant="text" className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}
