import { Home, MapPin } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import type { FilterState, ListingPurpose, PropertyStatus, PropertyType } from '../../types'
import {
  AMENITIES,
  KIGALI_NEIGHBOURHOODS,
  PRICE_MAX,
  PRICE_MIN,
  PROPERTY_TYPES,
  SALE_PRICE_MAX,
  SALE_PRICE_MIN,
} from '../../utils/constants'
import { formatRwf } from '../../utils/format'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { RangeSlider } from '../ui/RangeSlider'
import { Select } from '../ui/Select'
import { cn } from '../../utils/cn'

export interface FilterPanelProps {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  setFilters: (patch: Partial<FilterState>) => void
  toggleAmenity: (amenity: FilterState['amenities'][number]) => void
  resetFilters: () => void
  className?: string
}

const ROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'rented', label: 'Rented' },
  { value: 'sold', label: 'Sold' },
]

const PURPOSE_TABS: { value: ListingPurpose | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'rent', label: 'For rent' },
  { value: 'sale', label: 'For sale' },
]

export function FilterPanel({ filters, setFilter, setFilters, toggleAmenity, resetFilters, className }: FilterPanelProps) {
  const { t } = useLanguage()
  const isSale = filters.purpose === 'sale'
  const priceMin = isSale ? SALE_PRICE_MIN : PRICE_MIN
  const priceMax = isSale ? SALE_PRICE_MAX : PRICE_MAX

  function selectPurpose(next: ListingPurpose | null) {
    setFilters({
      purpose: next,
      priceMin: next === 'sale' ? SALE_PRICE_MIN : PRICE_MIN,
      priceMax: next === 'sale' ? SALE_PRICE_MAX : PRICE_MAX,
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy-900 dark:text-white">{t('filters.title')}</h2>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          {t('filters.reset')}
        </Button>
      </div>

      <div className="flex rounded-xl border border-navy-700/15 p-1 dark:border-navy-700">
        {PURPOSE_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => selectPurpose((tab.value || null) as ListingPurpose | null)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              (filters.purpose ?? '') === tab.value
                ? 'bg-blue-500 text-white shadow-glow'
                : 'text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
            )}
          >
            {tab.value === '' ? t('filters.all') : t(tab.value === 'sale' ? 'listing.forSale' : 'listing.forRent')}
          </button>
        ))}
      </div>

      <Input
        label={t('filters.location')}
        placeholder="e.g. Kimironko, Kiyovu"
        leftIcon={<MapPin className="h-4 w-4" />}
        value={filters.location}
        onChange={(e) => setFilter('location', e.target.value)}
        list="filter-neighbourhoods"
      />
      <datalist id="filter-neighbourhoods">
        {KIGALI_NEIGHBOURHOODS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <RangeSlider
        label={isSale ? 'Sale price (RWF)' : 'Monthly rent (RWF)'}
        min={priceMin}
        max={priceMax}
        step={isSale ? 5000000 : 10000}
        value={[filters.priceMin, filters.priceMax]}
        onChange={([min, max]) => setFilters({ priceMin: min, priceMax: max })}
        formatValue={formatRwf}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label={t('filters.bedrooms')}
          options={ROOM_OPTIONS}
          value={filters.bedrooms?.toString() ?? ''}
          onChange={(e) => setFilter('bedrooms', e.target.value ? Number(e.target.value) : null)}
        />
        <Select
          label={t('filters.bathrooms')}
          options={ROOM_OPTIONS}
          value={filters.bathrooms?.toString() ?? ''}
          onChange={(e) => setFilter('bathrooms', e.target.value ? Number(e.target.value) : null)}
        />
      </div>

      <Select
        label={t('filters.propertyType')}
        options={[{ value: '', label: 'Any type' }, ...PROPERTY_TYPES]}
        value={filters.type ?? ''}
        onChange={(e) => setFilter('type', (e.target.value || null) as PropertyType | null)}
      />

      <div>
        <p className="mb-1.5 text-sm font-medium text-navy-900 dark:text-white">{t('filters.furnished')}</p>
        <div className="flex gap-2">
          {[
            { label: 'Any', value: null },
            { label: 'Furnished', value: true },
            { label: 'Unfurnished', value: false },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setFilter('furnished', option.value)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                filters.furnished === option.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                  : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-navy-900 dark:text-white">
          <Home className="h-4 w-4" aria-hidden="true" />
          {t('filters.amenities')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map((amenity) => {
            const checked = filters.amenities.includes(amenity.value)
            return (
              <label
                key={amenity.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                  checked
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(amenity.value)}
                  className="sr-only"
                />
                <amenity.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {amenity.label}
              </label>
            )
          })}
        </div>
      </div>

      <Select
        label={t('filters.availability')}
        options={STATUS_OPTIONS}
        value={filters.status ?? ''}
        onChange={(e) => setFilter('status', (e.target.value || null) as PropertyStatus | null)}
      />
    </div>
  )
}
