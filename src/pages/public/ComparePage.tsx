import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus, Scale, X } from 'lucide-react'
import { COST_LABELS } from '../../components/listings/CostBreakdown'
import { VerificationBadge } from '../../components/trust/VerificationBadge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Rating } from '../../components/ui/Rating'
import { Skeleton } from '../../components/ui/Skeleton'
import { useCompare } from '../../context/CompareContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAsync } from '../../hooks/useAsync'
import { propertiesService } from '../../services/propertiesService'
import type { Property } from '../../types'
import { AMENITIES } from '../../utils/constants'
import { formatRwf } from '../../utils/format'
import { sizedImage } from '../../utils/image'
import { totalMonthlyCosts } from '../../utils/verification'

interface Row {
  label: string
  render: (property: Property) => ReactNode
  /** Marks the best column for this row, when "best" is meaningful. */
  best?: (properties: Property[]) => string | undefined
}

function monthlyTotal(property: Property) {
  return property.price + totalMonthlyCosts(property.monthlyCosts)
}

function lowest(properties: Property[], value: (p: Property) => number) {
  const rentals = properties.filter((p) => p.purpose === 'rent')
  if (rentals.length < 2) return undefined
  return rentals.reduce((best, p) => (value(p) < value(best) ? p : best)).id
}

export function ComparePage() {
  const { compareIds, toggleCompare, clearCompare } = useCompare()
  const { t } = useLanguage()
  const { data, loading, error, reload } = useAsync(() => propertiesService.list(), [])

  const properties = compareIds
    .map((id) => (data ?? []).find((p) => p.id === id))
    .filter((p): p is Property => Boolean(p))

  const rows: Row[] = [
    {
      label: 'Price',
      render: (p) => `${formatRwf(p.price)}${p.purpose === 'rent' ? '/mo' : ''}`,
      best: (all) => lowest(all, (p) => p.price),
    },
    { label: 'Caution money', render: (p) => (p.cautionMoney > 0 ? formatRwf(p.cautionMoney) : '—') },
    ...COST_LABELS.map(({ key, label }) => ({
      label: `${label} (est.)`,
      render: (p: Property) => (p.purpose === 'sale' ? '—' : p.monthlyCosts[key] > 0 ? formatRwf(p.monthlyCosts[key]) : 'Included'),
    })),
    {
      label: t('property.totalMonthly'),
      render: (p) => (p.purpose === 'rent' ? <span className="font-semibold">{formatRwf(monthlyTotal(p))}</span> : '—'),
      best: (all) => lowest(all, monthlyTotal),
    },
    { label: 'Verification', render: (p) => <VerificationBadge kind="property" status={p.verification} showUnverified /> },
    { label: 'Neighbourhood', render: (p) => p.district },
    { label: 'Type', render: (p) => <span className="capitalize">{p.type}</span> },
    { label: 'Bedrooms', render: (p) => p.bedrooms },
    { label: 'Bathrooms', render: (p) => p.bathrooms },
    { label: 'Size', render: (p) => `${p.sizeSqm} m²` },
    { label: 'Furnished', render: (p) => (p.furnished ? 'Yes' : 'No') },
    { label: 'Availability', render: (p) => <span className="capitalize">{p.status}</span> },
    { label: 'Rating', render: (p) => (p.reviewCount > 0 ? <Rating value={p.rating} count={p.reviewCount} /> : 'No reviews') },
    ...AMENITIES.map((amenity) => ({
      label: amenity.label,
      render: (p: Property) =>
        p.amenities.includes(amenity.value) ? (
          <Check className="h-4 w-4 text-emerald-500" aria-label="Yes" />
        ) : (
          <Minus className="h-4 w-4 text-slate-400" aria-label="No" />
        ),
    })),
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">Compare homes</h1>
          <p className="mt-2 text-slate-500">Side by side, including what each home really costs per month.</p>
        </div>
        {properties.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Clear all
          </Button>
        )}
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorState onRetry={reload} />
        ) : loading ? (
          <Skeleton className="h-96 w-full" />
        ) : properties.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="Nothing to compare yet"
            description="Tap the scale icon on up to three listings to see them side by side."
            action={
              <Link to="/browse">
                <Button>Browse listings</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-navy-700/10 bg-white dark:border-navy-700 dark:bg-navy-800">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr>
                  <td className="sticky left-0 z-10 w-28 bg-white p-3 dark:bg-navy-800 sm:w-40 sm:p-4" />
                  {properties.map((property) => (
                    <th key={property.id} scope="col" className="w-56 min-w-[11rem] p-3 align-top font-normal sm:min-w-[13rem] sm:p-4">
                      <div className="relative">
                        <img
                          src={sizedImage(property.images[0], 480)}
                          alt=""
                          loading="lazy"
                          className="aspect-[4/3] w-full rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => toggleCompare(property.id)}
                          aria-label={`Remove ${property.title} from comparison`}
                          className="absolute right-2 top-2 rounded-full bg-navy-950/60 p-1.5 text-white hover:bg-navy-950/80"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <Link
                        to={`/listings/${property.id}`}
                        className="mt-3 line-clamp-2 block font-semibold text-navy-900 hover:text-blue-500 dark:text-white"
                      >
                        {property.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/10 dark:divide-navy-700">
                {rows.map((row) => {
                  const bestId = row.best?.(properties)
                  return (
                    <tr key={row.label}>
                      <th scope="row" className="sticky left-0 z-10 bg-white p-3 text-xs font-medium text-slate-500 dark:bg-navy-800 sm:p-4 sm:text-sm">
                        {row.label}
                      </th>
                      {properties.map((property) => (
                        <td key={property.id} className="p-3 text-navy-900 dark:text-white sm:p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {row.render(property)}
                            {bestId === property.id && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Lowest
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
