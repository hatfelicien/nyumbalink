import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { BedDouble, CalendarDays, Eye, EyeOff, Maximize, MapPin, ShowerHead, Sofa, TriangleAlert } from 'lucide-react'
import { AmenityGrid } from '../../components/listings/AmenityGrid'
import { CompareButton } from '../../components/listings/CompareButton'
import { CostBreakdown } from '../../components/listings/CostBreakdown'
import { FavoriteButton } from '../../components/listings/FavoriteButton'
import { OwnerCard } from '../../components/listings/OwnerCard'
import { PropertyMap } from '../../components/listings/PropertyMap'
import { PropertyReviews } from '../../components/listings/PropertyReviews'
import { ShareButton } from '../../components/listings/ShareButton'
import { SimilarListings } from '../../components/listings/SimilarListings'
import { VideoTour } from '../../components/listings/VideoTour'
import { TrustPanel } from '../../components/trust/TrustPanel'
import { VerificationBadge } from '../../components/trust/VerificationBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { ImageGallery } from '../../components/ui/ImageGallery'
import { Rating } from '../../components/ui/Rating'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAsync } from '../../hooks/useAsync'
import { useInView } from '../../hooks/useInView'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'
import { propertiesService } from '../../services/propertiesService'
import { viewingsService } from '../../services/rentalsService'
import { usersService } from '../../services/usersService'
import { distanceKm, KIGALI_LANDMARKS } from '../../utils/constants'
import { formatDate, formatRwf } from '../../utils/format'
import { cn } from '../../utils/cn'
import { totalMonthlyCosts, trustLevel } from '../../utils/verification'
import { NotFoundPage } from './NotFoundPage'

const STATUS_VARIANT = { available: 'success', reserved: 'pending', rented: 'danger', sold: 'danger' } as const

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: property, loading, error, reload } = useAsync(() => propertiesService.getById(id!), [id])
  const { data: owner } = useAsync(() => (property ? usersService.getById(property.ownerId) : Promise.resolve(undefined)), [property?.ownerId])
  const { user } = useAuth()
  const { t } = useLanguage()
  // The exact address of an approximate listing unlocks once the landlord has confirmed a visit.
  const { data: hasViewing } = useAsync(
    () =>
      user
        ? viewingsService
            .listAll()
            .then((all) => all.some((v) => v.propertyId === id && v.tenantId === user.id && (v.status === 'confirmed' || v.status === 'completed')))
        : Promise.resolve(false),
    [id, user?.id],
  )
  const { recordView } = useRecentlyViewed()
  // The sticky call-to-action steps aside while the real contact card is on screen.
  const contactInView = useInView('contact-owner', [property?.id, owner?.id])

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

  // Drafts, listings awaiting review and flagged listings are only visible to their owner and to admins.
  const canManage = user?.role === 'admin' || user?.id === property.ownerId
  if (property.listingStatus !== 'published' && !canManage) return <NotFoundPage />

  const showExact = property.locationPrecision === 'exact' || canManage || Boolean(hasViewing)
  const mapProperty = showExact ? { ...property, locationPrecision: 'exact' as const } : property
  const level = trustLevel(property, owner)

  const nearbyLandmarks = [...KIGALI_LANDMARKS]
    .map((landmark) => ({ ...landmark, distance: distanceKm(property.coordinates, landmark.coordinates) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4)

  const specs = [
    { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
    { icon: ShowerHead, label: 'Bathrooms', value: property.bathrooms },
    { icon: Maximize, label: 'Size', value: `${property.sizeSqm} m²` },
    { icon: Sofa, label: 'Furnishing', value: property.furnished ? 'Furnished' : 'Unfurnished' },
  ]
  const monthlyTotal = property.price + totalMonthlyCosts(property.monthlyCosts)

  function scrollToContact() {
    document.getElementById('contact-owner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pt-8 lg:px-8 lg:pb-12">
      {property.listingStatus !== 'published' && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          This listing is {property.listingStatus === 'flagged' ? 'hidden after reports' : `not public yet (${property.listingStatus})`}. Only you and admins can see it.
        </p>
      )}
      <ImageGallery images={property.images} alt={property.title} />

      <div className="mt-6 grid grid-cols-1 gap-8 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-10">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-navy-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white/10">
                  {property.purpose === 'sale' ? 'For sale' : 'For rent'}
                </span>
                <Badge variant={STATUS_VARIANT[property.status]} className="capitalize" dot>
                  {property.status}
                </Badge>
                {level === 'full' ? (
                  <VerificationBadge kind="full" />
                ) : level === 'none' ? (
                  <VerificationBadge kind="property" status={property.verification} showUnverified />
                ) : (
                  <VerificationBadge kind={level} />
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-navy-900 dark:text-white sm:text-3xl">{property.title}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-slate-500">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {property.district}
                {property.reviewCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <Rating value={property.rating} count={property.reviewCount} />
                  </>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <CompareButton propertyId={property.id} variant="label" />
              <ShareButton title={property.title} />
              <FavoriteButton propertyId={property.id} className="h-10 w-10 border border-navy-700/15 shadow-none dark:border-navy-700" />
            </div>
          </div>

          {property.status !== 'available' && property.availableFrom && (
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
              Expected to be available again from {formatDate(property.availableFrom)}.
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-navy-700/10 bg-navy-700/10 dark:border-navy-700 dark:bg-navy-700 sm:grid-cols-3">
            <div className="col-span-2 bg-white p-4 dark:bg-navy-800 sm:col-span-1">
              <dt className="text-xs font-medium text-slate-500">{property.purpose === 'rent' ? 'Rent per month' : 'Asking price'}</dt>
              <dd className="mt-1 text-2xl font-bold text-navy-900 dark:text-white">{formatRwf(property.price)}</dd>
              {property.negotiable && <dd className="mt-0.5 text-xs font-medium text-blue-500 dark:text-blue-400">Negotiable</dd>}
            </div>
            {property.purpose === 'rent' ? (
              <>
                <div className="bg-white p-4 dark:bg-navy-800">
                  <dt className="text-xs font-medium text-slate-500">Caution money</dt>
                  <dd className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">
                    {property.cautionMoney > 0 ? formatRwf(property.cautionMoney) : 'None'}
                  </dd>
                  <dd className="mt-0.5 text-xs text-slate-500">Refundable</dd>
                </div>
                <div className="bg-white p-4 dark:bg-navy-800">
                  <dt className="text-xs font-medium text-slate-500">{t('property.totalMonthly')}</dt>
                  <dd className="mt-1 text-lg font-semibold text-navy-900 dark:text-white">{formatRwf(monthlyTotal)}</dd>
                  <dd className="mt-0.5 text-xs text-slate-500">Rent + bills</dd>
                </div>
              </>
            ) : (
              <div className="bg-white p-4 dark:bg-navy-800 sm:col-span-2">
                <dt className="text-xs font-medium text-slate-500">Type</dt>
                <dd className="mt-1 text-lg font-semibold capitalize text-navy-900 dark:text-white">{property.type}</dd>
              </div>
            )}
          </dl>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map((spec) => (
              <li key={spec.label} className="flex items-center gap-3 rounded-xl bg-navy-900/[0.03] px-3.5 py-3 dark:bg-white/5">
                <spec.icon className="h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{spec.label}</p>
                  <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{spec.value}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 leading-relaxed text-slate-600 dark:text-slate-300">{property.description}</p>
        </div>

        {owner && (
          <aside id="contact-owner" className="scroll-mt-20 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="space-y-5 lg:sticky lg:top-24">
              <OwnerCard owner={owner} property={property} />
              <TrustPanel property={property} owner={owner} />
            </div>
          </aside>
        )}

        <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-2">
          <section>
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Amenities</h2>
            <div className="mt-4">
              <AmenityGrid amenities={property.amenities} />
            </div>
          </section>

          {property.purpose === 'rent' && (
            <section>
              <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Monthly cost</h2>
              <div className="mt-4">
                <CostBreakdown property={property} />
              </div>
            </section>
          )}

          {property.videoUrl && (
            <section>
              <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Video tour</h2>
              <div className="mt-4">
                <VideoTour url={property.videoUrl} poster={property.images[0]} title={property.title} />
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Location</h2>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
              {showExact ? (
                <Eye className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              {showExact
                ? property.address
                : `${property.district} — general area only. The exact address is shared once the landlord confirms your viewing.`}
            </p>
            <div className="mt-4 h-72 overflow-hidden rounded-2xl border border-navy-700/10 dark:border-navy-700 sm:h-80">
              <PropertyMap properties={[mapProperty]} landmarks={nearbyLandmarks} className="h-full w-full" />
            </div>
          </section>

          <PropertyReviews propertyId={property.id} />
          <SimilarListings property={property} />
        </div>
      </div>

      {/* Phones and tablets: the contact card sits below the fold, so keep the next step one tap away. */}
      <div
        className={cn(
          'bottom-tabbar fixed inset-x-3 z-30 transition-all duration-300 md:bottom-4 lg:hidden print:hidden',
          contactInView ? 'pointer-events-none translate-y-4 opacity-0' : 'translate-y-0 opacity-100',
        )}
        aria-hidden={contactInView || undefined}
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-navy-700/10 bg-white/95 p-2.5 pl-4 shadow-soft backdrop-blur-xl dark:border-navy-700 dark:bg-navy-800/95">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-navy-900 dark:text-white">
              {formatRwf(property.price)}
              {property.purpose === 'rent' && <span className="text-xs font-normal text-slate-500">/mo</span>}
            </p>
            <p className="truncate text-xs text-slate-500">{property.district}</p>
          </div>
          <Button onClick={scrollToContact} icon={<CalendarDays className="h-4 w-4" />} className="shrink-0">
            {t('property.scheduleViewing')}
          </Button>
        </div>
      </div>
    </div>
  )
}
