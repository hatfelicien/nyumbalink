import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Amenity, FilterState, ListingPurpose, PropertyStatus, PropertyType } from '../types'
import { PRICE_MAX, PRICE_MIN } from '../utils/constants'

const DEFAULT_FILTERS: FilterState = {
  location: '',
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  bedrooms: null,
  bathrooms: null,
  type: null,
  purpose: null,
  furnished: null,
  amenities: [],
  status: null,
  verifiedOnly: false,
  sort: 'newest',
}

/** Reads a browse-page query string into filters. Also used to re-run saved searches. */
export function parseFilters(searchParams: URLSearchParams): FilterState {
  const amenitiesParam = searchParams.get('amenities')
  return {
    location: searchParams.get('location') ?? DEFAULT_FILTERS.location,
    priceMin: Number(searchParams.get('priceMin') ?? DEFAULT_FILTERS.priceMin),
    priceMax: Number(searchParams.get('priceMax') ?? DEFAULT_FILTERS.priceMax),
    bedrooms: searchParams.has('bedrooms') ? Number(searchParams.get('bedrooms')) : null,
    bathrooms: searchParams.has('bathrooms') ? Number(searchParams.get('bathrooms')) : null,
    type: (searchParams.get('type') as PropertyType | null) ?? null,
    purpose: (searchParams.get('purpose') as ListingPurpose | null) ?? null,
    furnished: searchParams.has('furnished') ? searchParams.get('furnished') === 'true' : null,
    amenities: amenitiesParam ? (amenitiesParam.split(',') as Amenity[]) : [],
    status: (searchParams.get('status') as PropertyStatus | null) ?? null,
    verifiedOnly: searchParams.get('verifiedOnly') === 'true',
    sort: (searchParams.get('sort') as FilterState['sort']) ?? DEFAULT_FILTERS.sort,
  }
}

/** A short human label for a set of filters, used to name saved searches. */
export function describeFilters(filters: FilterState) {
  const parts: string[] = []
  if (filters.purpose) parts.push(filters.purpose === 'sale' ? 'For sale' : 'For rent')
  if (filters.type) parts.push(filters.type)
  if (filters.bedrooms !== null) parts.push(`${filters.bedrooms}+ beds`)
  if (filters.location) parts.push(filters.location)
  if (filters.priceMax !== DEFAULT_FILTERS.priceMax && filters.purpose !== 'sale') {
    parts.push(`up to ${Math.round(filters.priceMax / 1000)}k RWF`)
  }
  if (filters.furnished !== null) parts.push(filters.furnished ? 'furnished' : 'unfurnished')
  if (filters.verifiedOnly) parts.push('verified')
  parts.push(...filters.amenities)
  return parts.length > 0 ? parts.join(' · ') : 'All listings'
}

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<FilterState>(() => parseFilters(searchParams), [searchParams])

  function applyFilterEntry<K extends keyof FilterState>(params: URLSearchParams, key: K, value: FilterState[K]) {
    const isDefault = JSON.stringify(value) === JSON.stringify(DEFAULT_FILTERS[key])
    const isEmptyArray = Array.isArray(value) && value.length === 0
    const isNullish = value === null || value === ''

    if (isDefault || isEmptyArray || isNullish) {
      params.delete(key)
    } else if (Array.isArray(value)) {
      params.set(key, value.join(','))
    } else {
      params.set(key, String(value))
    }
  }

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          applyFilterEntry(next, key, value)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // setFilter calls made back-to-back in the same handler each diff against the
  // pre-click URLSearchParams (react-router's setSearchParams doesn't queue functional
  // updates the way React state does), so only the last call would survive. Anything
  // that needs to change more than one filter key at once must go through here instead.
  const setFilters = useCallback(
    (patch: Partial<FilterState>) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const key of Object.keys(patch) as (keyof FilterState)[]) {
            applyFilterEntry(next, key, patch[key] as FilterState[typeof key])
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

  return { filters, setFilter, setFilters, toggleAmenity, resetFilters, defaultFilters: DEFAULT_FILTERS }
}
