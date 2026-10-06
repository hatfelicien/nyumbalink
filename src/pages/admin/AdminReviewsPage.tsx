import { useState } from 'react'
import { BadgeCheck, Check, MessageSquareWarning, TriangleAlert, X } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Rating } from '../../components/ui/Rating'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { reviewsService } from '../../services/reviewsService'
import type { ReviewStatus } from '../../types'
import { formatDate } from '../../utils/format'

const STATUS_VARIANT = { pending: 'pending', published: 'success', rejected: 'danger' } as const

export function AdminReviewsPage() {
  const { data, loading, error, reload } = useAsync(() => reviewsService.listForModeration(), [])
  const { showToast } = useToast()
  const [tab, setTab] = useState<ReviewStatus>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  const reviews = data ?? []
  const count = (status: ReviewStatus) => reviews.filter((r) => r.status === status).length
  const filtered = reviews.filter((r) => r.status === tab)

  async function moderate(id: string, status: 'published' | 'rejected') {
    setBusyId(id)
    await reviewsService.moderate(id, status)
    setBusyId(null)
    showToast(status === 'published' ? 'Review published' : 'Review rejected', { variant: 'success' })
    reload()
  }

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-slate-500">
        Only people who visited or rented a home through NyumbaLink can review it, and nothing is public until it is approved
        here. Screening notes point at likely spam — they never reject a review on their own.
      </p>

      <Tabs
        items={[
          { value: 'pending', label: 'Pending', count: count('pending') },
          { value: 'published', label: 'Published', count: count('published') },
          { value: 'rejected', label: 'Rejected', count: count('rejected') },
        ]}
        value={tab}
        onChange={(v) => setTab(v as ReviewStatus)}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} title={`No ${tab} reviews`} />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {filtered.map((review) => (
            <Card key={review.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white">{review.authorName}</p>
                  <p className="text-sm text-slate-500">{review.property?.title ?? 'Listing removed'}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Rating value={review.rating} />
                  <Badge variant={STATUS_VARIANT[review.status]} className="capitalize">
                    {review.status}
                  </Badge>
                </div>
              </div>

              {review.verifiedTenant && (
                <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Signed a rental agreement for this home
                </p>
              )}

              <p className="text-sm leading-relaxed text-navy-900 dark:text-white">{review.comment}</p>

              {(review.flags ?? []).length > 0 && (
                <ul className="space-y-1 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  {review.flags!.map((flag) => (
                    <li key={flag} className="flex items-center gap-1.5">
                      <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {flag}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>

              <div className="flex gap-2">
                {review.status !== 'published' && (
                  <Button
                    size="sm"
                    className="flex-1"
                    icon={<Check className="h-4 w-4" />}
                    loading={busyId === review.id}
                    onClick={() => moderate(review.id, 'published')}
                  >
                    Publish
                  </Button>
                )}
                {review.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    icon={<X className="h-4 w-4" />}
                    disabled={busyId === review.id}
                    onClick={() => moderate(review.id, 'rejected')}
                  >
                    {review.status === 'published' ? 'Take down' : 'Reject'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
