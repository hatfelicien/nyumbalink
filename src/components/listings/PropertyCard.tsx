import { Link } from 'react-router-dom'
import { BedDouble, MapPin, Maximize, ShowerHead } from 'lucide-react'
import { useDataSaver } from '../../context/DataSaverContext'
import { useLanguage } from '../../context/LanguageContext'
import type { Property } from '../../types'
import { Rating } from '../ui/Rating'
import { VerificationBadge } from '../trust/VerificationBadge'
import { CompareButton } from './CompareButton'
import { FavoriteButton } from './FavoriteButton'
import { formatRwf } from '../../utils/format'
import { sizedImage } from '../../utils/image'
import { cn } from '../../utils/cn'

const STATUS_DOT = {
  available: 'bg-emerald-500',
  reserved: 'bg-amber-500',
  rented: 'bg-rose-500',
  sold: 'bg-rose-500',
} as const

const STATUS_KEY = {
  available: 'status.available',
  reserved: 'status.reserved',
  rented: 'status.rented',
  sold: 'status.sold',
} as const

export interface PropertyCardProps {
  property: Property
  highlighted?: boolean
  view?: 'grid' | 'list'
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function PropertyCard({ property, highlighted, view = 'grid', onMouseEnter, onMouseLeave }: PropertyCardProps) {
  const { t } = useLanguage()
  const { dataSaver } = useDataSaver()
  const isList = view === 'list'

  return (
    // The title link stretches over the whole card (its ::after), so the save/compare
    // buttons can sit on top without nesting interactive elements inside the link.
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'group relative flex h-full overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-soft focus-within:shadow-soft dark:bg-navy-800',
        highlighted ? 'border-blue-400 ring-2 ring-blue-400/30' : 'border-navy-700/10 dark:border-navy-700',
        isList ? 'flex-row' : 'flex-col',
      )}
    >
      <div className={cn('relative shrink-0 overflow-hidden bg-navy-900/5 dark:bg-white/5', isList ? 'w-36 sm:w-56' : 'aspect-[4/3] w-full')}>
        <img
          src={sizedImage(property.images[0], isList ? 480 : 640, dataSaver)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-navy-950/45 to-transparent" aria-hidden="true" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-navy-950/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            {t(property.purpose === 'sale' ? 'listing.forSale' : 'listing.forRent')}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-navy-900 backdrop-blur dark:bg-navy-900/85 dark:text-white">
            <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[property.status])} aria-hidden="true" />
            {t(STATUS_KEY[property.status])}
          </span>
        </div>
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <FavoriteButton propertyId={property.id} />
          <CompareButton propertyId={property.id} />
        </div>
        {!isList && (
          <VerificationBadge kind="property" status={property.verification} solid className="absolute bottom-3 left-3" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        {isList && <VerificationBadge kind="property" status={property.verification} className="mb-2 self-start" />}
        <h3 className="line-clamp-1 font-semibold text-navy-900 dark:text-white">
          <Link
            to={`/listings/${property.id}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:ring-0 focus-visible:after:ring-2 focus-visible:after:ring-blue-400"
          >
            {property.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{property.district}</span>
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-lg font-bold leading-tight text-navy-900 dark:text-white">
            {formatRwf(property.price)}
            {property.purpose === 'rent' && <span className="text-sm font-normal text-slate-500">/mo</span>}
            {property.negotiable && (
              <span className="mt-0.5 block text-xs font-medium text-blue-500 dark:text-blue-400">{t('listing.negotiable')}</span>
            )}
          </p>
          {property.reviewCount > 0 && <Rating value={property.rating} count={property.reviewCount} className="shrink-0" />}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-4 border-t border-navy-700/10 pt-3 text-sm text-slate-500 dark:border-navy-700">
            <span className="flex items-center gap-1.5" title="Bedrooms">
              <BedDouble className="h-4 w-4" aria-hidden="true" />
              {property.bedrooms}
              <span className="sr-only">bedrooms</span>
            </span>
            <span className="flex items-center gap-1.5" title="Bathrooms">
              <ShowerHead className="h-4 w-4" aria-hidden="true" />
              {property.bathrooms}
              <span className="sr-only">bathrooms</span>
            </span>
            <span className="flex items-center gap-1.5" title="Size">
              <Maximize className="h-4 w-4" aria-hidden="true" />
              {property.sizeSqm} m²
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
