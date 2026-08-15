import type { FilterState, Property } from '../types'

export function filterProperties(properties: Property[], filters: FilterState): Property[] {
  const filtered = properties.filter((property) => {
    if (filters.location && !property.district.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }
    if (property.price < filters.priceMin || property.price > filters.priceMax) return false
    if (filters.bedrooms !== null && property.bedrooms < filters.bedrooms) return false
    if (filters.bathrooms !== null && property.bathrooms < filters.bathrooms) return false
    if (filters.type !== null && property.type !== filters.type) return false
    if (filters.furnished !== null && property.furnished !== filters.furnished) return false
    if (filters.status !== null && property.status !== filters.status) return false
    if (filters.amenities.length > 0 && !filters.amenities.every((a) => property.amenities.includes(a))) {
      return false
    }
    return property.listingStatus === 'published'
  })

  const sorted = [...filtered]
  switch (filters.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating)
      break
    default:
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return sorted
}
