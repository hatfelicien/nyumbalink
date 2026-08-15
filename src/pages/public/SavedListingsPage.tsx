import { Heart } from 'lucide-react'
import { PropertyCard } from '../../components/listings/PropertyCard'
import { PropertyCardSkeleton } from '../../components/listings/PropertyCardSkeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { useFavorites } from '../../context/FavoritesContext'
import { useAsync } from '../../hooks/useAsync'
import { propertiesService } from '../../services/propertiesService'

export function SavedListingsPage() {
  const { favoriteIds } = useFavorites()
  const { data, loading, error, reload } = useAsync(() => propertiesService.list(), [])

  const saved = (data ?? []).filter((property) => favoriteIds.includes(property.id))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">Saved listings</h1>
      <p className="mt-2 text-slate-500">Properties you have saved on this device.</p>

      <div className="mt-8">
        {error ? (
          <ErrorState onRetry={reload} />
        ) : loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : saved.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved listings yet"
            description="Tap the heart on any listing to save it here for later."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {saved.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
