import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Clock, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { reviewsService } from '../../services/reviewsService'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Rating } from '../ui/Rating'
import { Skeleton } from '../ui/Skeleton'
import { Textarea } from '../ui/Textarea'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'

function ReviewForm({ propertyId, asTenant, onSubmitted }: { propertyId: string; asTenant: boolean; onSubmitted: () => void }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (rating === 0) return setError('Choose a star rating.')
    if (comment.trim().length < 20) return setError('Write at least a sentence (20+ characters).')
    setSubmitting(true)
    try {
      await reviewsService.submit({ propertyId, authorId: user!.id, authorName: user!.name, rating, comment: comment.trim() })
      showToast('Review submitted', { description: 'It will appear once a moderator has approved it.', variant: 'success' })
      onSubmitted()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-navy-700/10 p-4 dark:border-navy-700">
      <p className="text-sm font-medium text-navy-900 dark:text-white">
        {asTenant ? 'You rented this home — how was it?' : 'You visited this home — how was it?'}
      </p>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value === 1 ? '' : 's'}`}
            onClick={() => {
              setRating(value)
              setError(null)
            }}
            className="rounded p-0.5"
          >
            <Star className={cn('h-6 w-6', value <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-400')} aria-hidden="true" />
          </button>
        ))}
      </div>
      <Textarea
        rows={3}
        aria-label="Your review"
        placeholder="What should the next tenant know? Water pressure, noise, how the landlord handles repairs…"
        value={comment}
        onChange={(e) => {
          setComment(e.target.value)
          setError(null)
        }}
        error={error ?? undefined}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Reviews are checked by a moderator before they are published.</p>
        <Button size="sm" onClick={handleSubmit} loading={submitting}>
          Submit review
        </Button>
      </div>
    </div>
  )
}

export function PropertyReviews({ propertyId }: { propertyId: string }) {
  const { user } = useAuth()
  const { data, loading } = useAsync(() => reviewsService.getByProperty(propertyId), [propertyId])
  const { data: eligibility, reload: reloadEligibility } = useAsync(
    () => (user ? reviewsService.getEligibility(propertyId, user.id) : Promise.resolve(null)),
    [propertyId, user?.id],
  )

  const reviews = data ?? []

  return (
    <section>
      <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Reviews</h2>
      <div className="mt-4 space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-500">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-navy-700/10 p-4 dark:border-navy-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar name={review.authorName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-navy-900 dark:text-white">{review.authorName}</p>
                    {review.verifiedTenant && (
                      <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Rented through NyumbaLink
                      </p>
                    )}
                  </div>
                </div>
                <Rating value={review.rating} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{review.comment}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(review.createdAt)}</p>
            </div>
          ))
        )}

        {!user ? (
          <p className="text-sm text-slate-500">
            <Link to={`/login?returnTo=${encodeURIComponent(`/listings/${propertyId}`)}`} className="font-medium text-blue-500 hover:text-blue-400">
              Log in
            </Link>{' '}
            to review a home you visited or rented.
          </p>
        ) : eligibility?.canReview ? (
          <ReviewForm propertyId={propertyId} asTenant={eligibility.reason === 'tenant'} onSubmitted={reloadEligibility} />
        ) : eligibility?.reason === 'already-reviewed' ? (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {eligibility.existing?.status === 'pending'
              ? 'Your review is waiting for a moderator.'
              : 'You have already reviewed this home.'}
          </p>
        ) : eligibility ? (
          <p className="text-sm text-slate-500">
            Only people who visited or rented this home through NyumbaLink can review it. That keeps fake reviews out.
          </p>
        ) : null}
      </div>
    </section>
  )
}
