import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { FilterState } from '../../types'
import { AMENITIES, PRICE_MAX, PRICE_MIN, PROPERTY_TYPES, SALE_PRICE_MAX, SALE_PRICE_MIN } from '../../utils/constants'
import { formatRwf } from '../../utils/format'

export interface FilterPanelSetters {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  setFilters: (patch: Partial<FilterState>) => void
  toggleAmenity: (amenity: FilterState['amenities'][number]) => void
}

interface Chip {
  key: string
  label: string
  onRemove: () => void
}

function buildChips({ filters, setFilter, setFilters, toggleAmenity }: FilterPanelSetters): Chip[] {
  const chips: Chip[] = []

  if (filters.location) {
    chips.push({ key: 'location', label: filters.location, onRemove: () => setFilter('location', '') })
  }
  const isSale = filters.purpose === 'sale'
  const defaultMin = isSale ? SALE_PRICE_MIN : PRICE_MIN
  const defaultMax = isSale ? SALE_PRICE_MAX : PRICE_MAX
  if (filters.priceMin !== defaultMin || filters.priceMax !== defaultMax) {
    chips.push({
      key: 'price',
      label: `${formatRwf(filters.priceMin)} – ${formatRwf(filters.priceMax)}`,
      onRemove: () => setFilters({ priceMin: defaultMin, priceMax: defaultMax }),
    })
  }
  if (filters.purpose) {
    chips.push({
      key: 'purpose',
      label: filters.purpose === 'sale' ? 'For sale' : 'For rent',
      onRemove: () => setFilters({ purpose: null, priceMin: PRICE_MIN, priceMax: PRICE_MAX }),
    })
  }
  if (filters.bedrooms !== null) {
    chips.push({ key: 'bedrooms', label: `${filters.bedrooms}+ beds`, onRemove: () => setFilter('bedrooms', null) })
  }
  if (filters.bathrooms !== null) {
    chips.push({ key: 'bathrooms', label: `${filters.bathrooms}+ baths`, onRemove: () => setFilter('bathrooms', null) })
  }
  if (filters.type) {
    const typeLabel = PROPERTY_TYPES.find((t) => t.value === filters.type)?.label ?? filters.type
    chips.push({ key: 'type', label: typeLabel, onRemove: () => setFilter('type', null) })
  }
  if (filters.furnished !== null) {
    chips.push({
      key: 'furnished',
      label: filters.furnished ? 'Furnished' : 'Unfurnished',
      onRemove: () => setFilter('furnished', null),
    })
  }
  if (filters.status) {
    chips.push({ key: 'status', label: filters.status, onRemove: () => setFilter('status', null) })
  }
  filters.amenities.forEach((amenity) => {
    const label = AMENITIES.find((a) => a.value === amenity)?.label ?? amenity
    chips.push({ key: `amenity-${amenity}`, label, onRemove: () => toggleAmenity(amenity) })
  })

  return chips
}

export function FilterChips(props: FilterPanelSetters) {
  const chips = buildChips(props)

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            type="button"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={chip.onRemove}
            className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-medium capitalize text-blue-500 transition-colors hover:bg-blue-500/20"
          >
            {chip.label}
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
