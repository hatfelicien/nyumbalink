import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BedDouble, MapPin, Maximize, ShowerHead } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import type { Property } from '../../types'
import { Badge } from '../ui/Badge'
import { Rating } from '../ui/Rating'
import { FavoriteButton } from './FavoriteButton'
import { formatRwf } from '../../utils/format'
import { cn } from '../../utils/cn'

const STATUS_VARIANT = {
  available: 'success',
  reserved: 'pending',
  rented: 'danger',
  sold: 'danger',
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

  return (
    <motion.div
      layout
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group overflow-hidden rounded-2xl border bg-white shadow-soft transition-shadow dark:bg-navy-800',
        highlighted ? 'border-blue-400 shadow-glow' : 'border-navy-700/10 hover:shadow-glow dark:border-navy-700',
        view === 'list' && 'flex',
      )}
    >
      <Link to={`/listings/${property.id}`} className={cn('block', view === 'list' && 'flex w-full')}>
        <div className={cn('relative overflow-hidden', view === 'grid' ? 'aspect-[4/3]' : 'w-56 shrink-0')}>
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant="brand" className="bg-navy-950/70 text-white dark:bg-navy-950/70">
              {t(property.purpose === 'sale' ? 'listing.forSale' : 'listing.forRent')}
            </Badge>
            <Badge variant={STATUS_VARIANT[property.status]}>{t(STATUS_KEY[property.status])}</Badge>
          </div>
          <FavoriteButton propertyId={property.id} className="absolute right-3 top-3" />
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg font-semibold text-navy-900 dark:text-white">
              {formatRwf(property.price)}
              {property.purpose === 'rent' && <span className="text-sm font-normal text-slate-500">/mo</span>}
            </p>
            <Rating value={property.rating} count={property.reviewCount} />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-1 text-sm font-medium text-navy-900 dark:text-white">{property.title}</h3>
            {property.negotiable && (
              <Badge variant="brand" className="shrink-0">
                {t('listing.negotiable')}
              </Badge>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {property.district}
          </p>
          <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4" aria-hidden="true" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-1.5">
              <ShowerHead className="h-4 w-4" aria-hidden="true" />
              {property.bathrooms}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize className="h-4 w-4" aria-hidden="true" />
              {property.sizeSqm} m²
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
