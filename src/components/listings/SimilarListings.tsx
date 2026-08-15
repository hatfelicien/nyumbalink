import { PropertyCard } from './PropertyCard'
import { PropertyCardSkeleton } from './PropertyCardSkeleton'
import { useAsync } from '../../hooks/useAsync'
import { propertiesService } from '../../services/propertiesService'
import type { Property } from '../../types'

export function SimilarListings({ property }: { property: Property }) {
  const { data, loading } = useAsync(() => propertiesService.getSimilar(property), [property.id])

  if (!loading && (data ?? []).length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-semibold text-navy-900 dark:text-white">Similar listings</h2>
      <div className="mt-4 flex snap-x gap-5 overflow-x-auto pb-2">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-72 shrink-0 snap-start">
                <PropertyCardSkeleton />
              </div>
            ))
          : data!.map((similar) => (
              <div key={similar.id} className="w-72 shrink-0 snap-start">
                <PropertyCard property={similar} />
              </div>
            ))}
      </div>
    </section>
  )
}
