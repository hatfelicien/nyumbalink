import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { BedDouble, Maximize, MapPin, ShowerHead, Sofa } from 'lucide-react'
import { AmenityGrid } from '../../components/listings/AmenityGrid'
import { FavoriteButton } from '../../components/listings/FavoriteButton'
import { OwnerCard } from '../../components/listings/OwnerCard'
import { PropertyMap } from '../../components/listings/PropertyMap'
import { PropertyReviews } from '../../components/listings/PropertyReviews'
import { ShareButton } from '../../components/listings/ShareButton'
import { SimilarListings } from '../../components/listings/SimilarListings'
import { Badge } from '../../components/ui/Badge'
import { ErrorState } from '../../components/ui/ErrorState'
import { ImageGallery } from '../../components/ui/ImageGallery'
import { Rating } from '../../components/ui/Rating'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAsync } from '../../hooks/useAsync'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'
import { propertiesService } from '../../services/propertiesService'
import { usersService } from '../../services/usersService'
import { distanceKm, KIGALI_LANDMARKS } from '../../utils/constants'
import { formatRwf } from '../../utils/format'
import { NotFoundPage } from './NotFoundPage'

const STATUS_VARIANT = { available: 'success', reserved: 'pending', rented: 'danger' } as const

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: property, loading, error, reload } = useAsync(() => propertiesService.getById(id!), [id])
  const { data: owner } = useAsync(() => (property ? usersService.getById(property.ownerId) : Promise.resolve(undefined)), [property?.ownerId])
  const { recordView } = useRecentlyViewed()

  useEffect(() => {
    if (property) recordView(property.id)
    // recordView is stable (useCallback with no deps); only re-run when the viewed property changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="aspect-[16/8] w-full" />
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState onRetry={reload} />
      </div>
    )
  }

  if (!property) return <NotFoundPage />

  const nearbyLandmarks = [...KIGALI_LANDMARKS]
    .map((landmark) => ({ ...landmark, distance: distanceKm(property.coordinates, landmark.coordinates) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ImageGallery images={property.images} alt={property.title} className="h-[22rem] sm:h-[26rem]" />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">{property.title}</h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {property.district}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[property.status]} className="capitalize">
                  {property.status}
                </Badge>
                <ShareButton title={property.title} />
                <FavoriteButton propertyId={property.id} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-5">
              <p className="text-3xl font-bold text-navy-900 dark:text-white">
                {formatRwf(property.price)}
                <span className="text-base font-normal text-slate-500">/month</span>
              </p>
              <Rating value={property.rating} count={property.reviewCount} />
            </div>

            <div className="mt-6 flex flex-wrap gap-6 border-y border-navy-700/10 py-4 text-sm text-navy-900 dark:border-navy-700 dark:text-white">
              <span className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                {property.bedrooms} bedrooms
              </span>
              <span className="flex items-center gap-2">
                <ShowerHead className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                {property.bathrooms} bathrooms
              </span>
              <span className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                {property.sizeSqm} m²
              </span>
              <span className="flex items-center gap-2">
                <Sofa className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                {property.furnished ? 'Furnished' : 'Unfurnished'}
              </span>
            </div>

            <p className="mt-6 leading-relaxed text-slate-500">{property.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Amenities</h2>
            <div className="mt-4">
              <AmenityGrid amenities={property.amenities} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Location</h2>
            <p className="mt-1 text-sm text-slate-500">{property.address}</p>
            <div className="mt-4 h-80 overflow-hidden rounded-2xl">
              <PropertyMap properties={[property]} landmarks={nearbyLandmarks} className="h-full w-full" />
            </div>
          </div>

          <PropertyReviews propertyId={property.id} />
          <SimilarListings property={property} />
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">{owner && <OwnerCard owner={owner} property={property} />}</div>
      </div>
    </div>
  )
}
