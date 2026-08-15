import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import type { ListingPurpose } from '../../types'
import { KIGALI_NEIGHBOURHOODS, LISTING_PURPOSES, PROPERTY_TYPES } from '../../utils/constants'
import { formatRwf } from '../../utils/format'
import { cn } from '../../utils/cn'

const PRICE_PRESETS = [
  { value: '', label: 'Any budget' },
  { value: '0-200000', label: `Under ${formatRwf(200000)}` },
  { value: '200000-500000', label: `${formatRwf(200000)} – ${formatRwf(500000)}` },
  { value: '500000-1000000', label: `${formatRwf(500000)} – ${formatRwf(1000000)}` },
  { value: '1000000-2500000', label: `Above ${formatRwf(1000000)}` },
]

const BEDROOM_OPTIONS = [
  { value: '', label: 'Any bedrooms' },
  { value: '1', label: '1+ bedroom' },
  { value: '2', label: '2+ bedrooms' },
  { value: '3', label: '3+ bedrooms' },
  { value: '4', label: '4+ bedrooms' },
]

export function HeroSearchBar() {
  const navigate = useNavigate()
  const [purpose, setPurpose] = useState<ListingPurpose>('rent')
  const [location, setLocation] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [type, setType] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    params.set('purpose', purpose)
    if (location) params.set('location', location)
    if (bedrooms) params.set('bedrooms', bedrooms)
    if (type) params.set('type', type)
    if (purpose === 'rent' && priceRange) {
      const [min, max] = priceRange.split('-')
      params.set('priceMin', min)
      params.set('priceMax', max)
    }
    navigate(`/browse?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="mx-auto flex w-fit rounded-full bg-white/10 p-1">
        {LISTING_PURPOSES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPurpose(option.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              purpose === option.value ? 'bg-white text-navy-900' : 'text-white/70 hover:text-white',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 rounded-2xl bg-white/95 p-4 shadow-soft backdrop-blur sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-end lg:p-3">
        <Input
          label="Location"
          placeholder="Kimironko, Kiyovu…"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          list="hero-neighbourhoods"
        />
        <datalist id="hero-neighbourhoods">
          {KIGALI_NEIGHBOURHOODS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        {purpose === 'rent' && (
          <Select label="Budget" options={PRICE_PRESETS} value={priceRange} onChange={(e) => setPriceRange(e.target.value)} />
        )}
        <Select label="Bedrooms" options={BEDROOM_OPTIONS} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
        <Select
          label="Type"
          options={[{ value: '', label: 'Any type' }, ...PROPERTY_TYPES]}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <Button type="submit" size="lg" className="w-full lg:w-auto" icon={<Search className="h-4 w-4" />}>
          Search
        </Button>
      </div>
    </form>
  )
}
