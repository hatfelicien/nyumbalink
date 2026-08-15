import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BedDouble, Maximize, ShowerHead, X } from 'lucide-react'
import type { Property } from '../../types'
import { Badge } from '../ui/Badge'
import { Rating } from '../ui/Rating'
import { FavoriteButton } from './FavoriteButton'
import { formatRwf } from '../../utils/format'

const STATUS_VARIANT = { available: 'success', reserved: 'pending', rented: 'danger', sold: 'danger' } as const

export interface PropertySlideCardProps {
  property: Property | null
  onClose: () => void
}

export function PropertySlideCard({ property, onClose }: PropertySlideCardProps) {
  return (
    <AnimatePresence>
      {property && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          className="absolute inset-x-4 bottom-4 z-[400] overflow-hidden rounded-2xl bg-white shadow-soft dark:bg-navy-800 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-80"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 z-10 rounded-full bg-navy-950/50 p-1.5 text-white hover:bg-navy-950/70"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <img src={property.images[0]} alt={property.title} className="h-40 w-full object-cover" />
          <FavoriteButton propertyId={property.id} className="absolute left-2 top-2 z-10" />
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-navy-900 dark:text-white">
                {formatRwf(property.price)}
                {property.purpose === 'rent' && '/mo'}
              </p>
              <Badge variant={STATUS_VARIANT[property.status]} className="capitalize">
                {property.status}
              </Badge>
            </div>
            <p className="line-clamp-1 text-sm font-medium text-navy-900 dark:text-white">{property.title}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                {property.bedrooms}
              </span>
              <span className="flex items-center gap-1">
                <ShowerHead className="h-3.5 w-3.5" aria-hidden="true" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" aria-hidden="true" />
                {property.sizeSqm} m²
              </span>
              <Rating value={property.rating} size="sm" />
            </div>
            <Link to={`/listings/${property.id}`} className="block pt-1 text-sm font-medium text-blue-500 hover:text-blue-400">
              View full listing →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
