import { useMemo, useState } from 'react'
import { ClusteredPropertyMap } from '../../components/listings/ClusteredPropertyMap'
import { PropertySlideCard } from '../../components/listings/PropertySlideCard'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAsync } from '../../hooks/useAsync'
import { propertiesService } from '../../services/propertiesService'

export function MapSearchPage() {
  const { data, loading, error, reload } = useAsync(() => propertiesService.list(), [])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const published = useMemo(() => (data ?? []).filter((p) => p.listingStatus === 'published'), [data])
  const selected = published.find((p) => p.id === selectedId) ?? null

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {loading ? (
        <Skeleton className="h-full w-full rounded-none" />
      ) : error ? (
        <div className="flex h-full items-center justify-center px-4">
          <ErrorState onRetry={reload} />
        </div>
      ) : (
        <>
          <ClusteredPropertyMap
            properties={published}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="h-full w-full"
          />
          <PropertySlideCard property={selected} onClose={() => setSelectedId(null)} />
        </>
      )}
    </div>
  )
}
