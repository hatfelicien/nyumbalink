import { reviews as seedReviews } from '../data/reviews'
import type { Review } from '../types'
import { withDelay } from './delay'

const store: Review[] = [...seedReviews]

export const reviewsService = {
  getByProperty(propertyId: string): Promise<Review[]> {
    return withDelay(() => store.filter((r) => r.propertyId === propertyId))
  },
}
