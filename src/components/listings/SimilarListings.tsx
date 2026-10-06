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
      <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[78%] max-w-[18rem] shrink-0 snap-start sm:w-72">
                <PropertyCardSkeleton />
              </div>
            ))
          : data!.map((similar) => (
              <div key={similar.id} className="w-[78%] max-w-[18rem] shrink-0 snap-start sm:w-72">
                <PropertyCard property={similar} />
              </div>
            ))}
      </div>
    </section>
  )
}
