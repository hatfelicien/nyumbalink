import { BadgeCheck, Home, MapPin } from 'lucide-react'
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
import { Switch } from '../ui/Switch'
import { cn } from '../../utils/cn'

export interface FilterPanelProps {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  setFilters: (patch: Partial<FilterState>) => void
  toggleAmenity: (amenity: FilterState['amenities'][number]) => void
  resetFilters: () => void
  className?: string
  /** The drawer on small screens has its own title and reset button. */
  showHeader?: boolean
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

export function FilterPanel({
  filters,
  setFilter,
  setFilters,
  toggleAmenity,
  resetFilters,
  className,
  showHeader = true,
}: FilterPanelProps) {
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
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">{t('filters.title')}</h2>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            {t('filters.reset')}
          </Button>
        </div>
      )}

      <div role="radiogroup" aria-label="Listing type" className="flex rounded-xl bg-navy-900/5 p-1 dark:bg-white/10">
        {PURPOSE_TABS.map((tab) => {
          const active = (filters.purpose ?? '') === tab.value
          return (
            <button
              key={tab.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => selectPurpose((tab.value || null) as ListingPurpose | null)}
              className={cn(
                'flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-all',
                active
                  ? 'bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white'
                  : 'text-slate-500 hover:text-navy-900 dark:hover:text-white',
              )}
            >
              {tab.value === '' ? t('filters.all') : t(tab.value === 'sale' ? 'listing.forSale' : 'listing.forRent')}
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-colors',
          filters.verifiedOnly ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-navy-700/15 dark:border-navy-700',
        )}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-navy-900 dark:text-white">
          <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          {t('filters.verifiedOnly')}
        </span>
        <Switch checked={filters.verifiedOnly} onChange={(checked) => setFilter('verifiedOnly', checked)} label={t('filters.verifiedOnly')} />
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
        <div role="radiogroup" aria-label={t('filters.furnished')} className="flex rounded-xl bg-navy-900/5 p-1 dark:bg-white/10">
          {[
            { label: 'Any', value: null },
            { label: 'Furnished', value: true },
            { label: 'Unfurnished', value: false },
          ].map((option) => {
            const active = filters.furnished === option.value
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFilter('furnished', option.value)}
                className={cn(
                  'min-w-0 flex-1 truncate rounded-lg px-1 py-2 text-xs font-medium transition-all',
                  active
                    ? 'bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white'
                    : 'text-slate-500 hover:text-navy-900 dark:hover:text-white',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 flex items-center gap-1.5 text-sm font-medium text-navy-900 dark:text-white">
          <Home className="h-4 w-4" aria-hidden="true" />
          {t('filters.amenities')}
        </legend>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => {
            const checked = filters.amenities.includes(amenity.value)
            return (
              <label
                key={amenity.value}
                className={cn(
                  'flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-400',
                  checked
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
                )}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleAmenity(amenity.value)} className="sr-only" />
                <amenity.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {amenity.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <Select
        label={t('filters.availability')}
        options={STATUS_OPTIONS}
        value={filters.status ?? ''}
        onChange={(e) => setFilter('status', (e.target.value || null) as PropertyStatus | null)}
      />
    </div>
  )
}
