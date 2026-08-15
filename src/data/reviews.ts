import type { Review } from '../types'

export const reviews: Review[] = [
  {
    id: 'review-1',
    propertyId: 'property-1',
    authorName: 'Claudine M.',
    rating: 5,
    comment: 'Very responsive landlord and the apartment was exactly as pictured. Loved the balcony view.',
    createdAt: '2026-06-20T10:00:00.000Z',
  },
  {
    id: 'review-2',
    propertyId: 'property-1',
    authorName: 'Fabrice K.',
    rating: 4,
    comment: 'Good value for the location. Generator kicked in quickly during the last outage.',
    createdAt: '2026-07-02T10:00:00.000Z',
  },
  {
    id: 'review-3',
    propertyId: 'property-3',
    authorName: 'Aisha N.',
    rating: 5,
    comment: 'Stunning villa, the garden is beautifully maintained and security is excellent.',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'review-4',
    propertyId: 'property-7',
    authorName: 'Thierry B.',
    rating: 5,
    comment: 'Worth every franc. The pool terrace and backup power made the rainy season a non-issue.',
    createdAt: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'review-5',
    propertyId: 'property-7',
    authorName: 'Marie C.',
    rating: 4,
    comment: 'Great house overall, though the compound gate could use a smoother motor.',
    createdAt: '2026-03-05T10:00:00.000Z',
  },
  {
    id: 'review-6',
    propertyId: 'property-17',
    authorName: 'Olivier R.',
    rating: 5,
    comment: 'The rooftop lounge is a huge bonus. Building management is professional and quick to respond.',
    createdAt: '2026-01-25T10:00:00.000Z',
  },
  {
    id: 'review-7',
    propertyId: 'property-22',
    authorName: 'Nadia P.',
    rating: 5,
    comment: 'One of the best-kept villas we viewed in Kiyovu. Staff quarters were a great addition.',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'review-8',
    propertyId: 'property-6',
    authorName: 'Samuel T.',
    rating: 4,
    comment: 'Solid apartment near Remera, though it can get noisy on market days.',
    createdAt: '2026-04-01T10:00:00.000Z',
  },
]

export const reviewsForProperty = (propertyId: string) => reviews.filter((r) => r.propertyId === propertyId)
