import { reviews as seedReviews } from '../data/reviews'
import type { Property, Review } from '../types'
import { generateId } from '../utils/id'
import { screenReview } from '../utils/moderation'
import { withDelay } from './delay'
import { ADMIN_AUDIENCE, notify } from './notificationsService'
import { propertiesService } from './propertiesService'
import { agreementsService, viewingsService } from './rentalsService'

let store: Review[] = [...seedReviews]

export interface ReviewEligibility {
  canReview: boolean
  /** Why the form is unavailable, or what the review will be tagged with. */
  reason: 'tenant' | 'visited' | 'not-visited' | 'already-reviewed'
  existing?: Review
}

export interface NewReview {
  propertyId: string
  authorId: string
  authorName: string
  rating: number
  comment: string
}

export type ReviewWithProperty = Review & { property: Property | undefined }

export const reviewsService = {
  /** Public view: published reviews only. */
  getByProperty(propertyId: string): Promise<Review[]> {
    return withDelay(() => store.filter((r) => r.propertyId === propertyId && r.status === 'published'))
  },

  /**
   * Reviews are limited to people with a real connection to the home on the platform —
   * a signed agreement or a visit the landlord marked as completed — and to one per person.
   */
  async getEligibility(propertyId: string, userId: string): Promise<ReviewEligibility> {
    const existing = store.find((r) => r.propertyId === propertyId && r.authorId === userId && r.status !== 'rejected')
    if (existing) return { canReview: false, reason: 'already-reviewed', existing }

    const [agreements, viewings] = await Promise.all([agreementsService.listAll(), viewingsService.listAll()])
    const rented = agreements.some(
      (a) => a.propertyId === propertyId && a.tenantId === userId && (a.status === 'active' || a.status === 'ended'),
    )
    if (rented) return { canReview: true, reason: 'tenant' }

    const visited = viewings.some((v) => v.propertyId === propertyId && v.tenantId === userId && v.status === 'completed')
    return visited ? { canReview: true, reason: 'visited' } : { canReview: false, reason: 'not-visited' }
  },

  /** New reviews always enter the moderation queue; screening only adds notes for the moderator. */
  async submit(input: NewReview): Promise<Review> {
    const eligibility = await reviewsService.getEligibility(input.propertyId, input.authorId)
    if (!eligibility.canReview) throw new Error('You can only review a home you visited or rented through NyumbaLink.')

    const created: Review = {
      ...input,
      id: generateId('review'),
      status: 'pending',
      verifiedTenant: eligibility.reason === 'tenant',
      flags: screenReview(input.comment),
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    notify(ADMIN_AUDIENCE, {
      title: 'Review waiting for moderation',
      body: created.flags?.length ? `Screening flagged it: ${created.flags.join(', ')}.` : 'A new review was submitted.',
      href: '/admin/reviews',
      channels: ['in_app'],
    })
    return created
  },

  async listForModeration(): Promise<ReviewWithProperty[]> {
    const properties = await propertiesService.list()
    return [...store]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((review) => ({ ...review, property: properties.find((p) => p.id === review.propertyId) }))
  },

  moderate(id: string, status: 'published' | 'rejected'): Promise<void> {
    store = store.map((r) => (r.id === id ? { ...r, status } : r))
    const review = store.find((r) => r.id === id)
    if (review?.authorId) {
      notify(review.authorId, {
        title: status === 'published' ? 'Your review is live' : 'Your review was not published',
        body:
          status === 'published'
            ? 'Thanks for helping other tenants choose with confidence.'
            : 'It did not meet the review guidelines. You can write a new one.',
        href: `/listings/${review.propertyId}`,
        channels: ['in_app'],
      })
    }
    return withDelay(() => undefined)
  },
}
