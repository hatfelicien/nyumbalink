import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Amenity, FilterState, PropertyStatus, PropertyType } from '../types'
import { PRICE_MAX, PRICE_MIN } from '../utils/constants'

const DEFAULT_FILTERS: FilterState = {
  location: '',
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  bedrooms: null,
  bathrooms: null,
  type: null,
  furnished: null,
  amenities: [],
  status: null,
  sort: 'newest',
}

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<FilterState>(() => {
    const amenitiesParam = searchParams.get('amenities')
    return {
      location: searchParams.get('location') ?? DEFAULT_FILTERS.location,
      priceMin: Number(searchParams.get('priceMin') ?? DEFAULT_FILTERS.priceMin),
      priceMax: Number(searchParams.get('priceMax') ?? DEFAULT_FILTERS.priceMax),
      bedrooms: searchParams.has('bedrooms') ? Number(searchParams.get('bedrooms')) : null,
      bathrooms: searchParams.has('bathrooms') ? Number(searchParams.get('bathrooms')) : null,
      type: (searchParams.get('type') as PropertyType | null) ?? null,
      furnished: searchParams.has('furnished') ? searchParams.get('furnished') === 'true' : null,
      amenities: amenitiesParam ? (amenitiesParam.split(',') as Amenity[]) : [],
      status: (searchParams.get('status') as PropertyStatus | null) ?? null,
      sort: (searchParams.get('sort') as FilterState['sort']) ?? DEFAULT_FILTERS.sort,
    }
  }, [searchParams])

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          const isDefault = JSON.stringify(value) === JSON.stringify(DEFAULT_FILTERS[key])
          const isEmptyArray = Array.isArray(value) && value.length === 0
          const isNullish = value === null || value === ''

          if (isDefault || isEmptyArray || isNullish) {
            next.delete(key)
          } else if (Array.isArray(value)) {
            next.set(key, value.join(','))
          } else {
            next.set(key, String(value))
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const toggleAmenity = useCallback(
    (amenity: Amenity) => {
      const next = filters.amenities.includes(amenity)
        ? filters.amenities.filter((a) => a !== amenity)
        : [...filters.amenities, amenity]
      setFilter('amenities', next)
    },
    [filters.amenities, setFilter],
  )

  const resetFilters = useCallback(() => setSearchParams(new URLSearchParams(), { replace: true }), [setSearchParams])

  return { filters, setFilter, toggleAmenity, resetFilters, defaultFilters: DEFAULT_FILTERS }
}
