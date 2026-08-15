import { useAsync } from '../../hooks/useAsync'
import { reviewsService } from '../../services/reviewsService'
import { Avatar } from '../ui/Avatar'
import { Rating } from '../ui/Rating'
import { Skeleton } from '../ui/Skeleton'
import { formatDate } from '../../utils/format'

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const { data, loading } = useAsync(() => reviewsService.getByProperty(propertyId), [propertyId])

  if (!loading && (data ?? []).length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Reviews</h2>
      <div className="mt-4 space-y-4">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          : data!.map((review) => (
              <div key={review.id} className="rounded-xl border border-navy-700/10 p-4 dark:border-navy-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={review.authorName} size="sm" />
                    <p className="text-sm font-medium text-navy-900 dark:text-white">{review.authorName}</p>
                  </div>
                  <Rating value={review.rating} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{review.comment}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(review.createdAt)}</p>
              </div>
            ))}
      </div>
    </section>
  )
}
