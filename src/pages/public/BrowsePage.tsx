import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BrowseToolbar } from '../../components/listings/BrowseToolbar'
import { FilterChips } from '../../components/listings/FilterChips'
import { FilterPanel } from '../../components/listings/FilterPanel'
import { PropertyCard } from '../../components/listings/PropertyCard'
import { PropertyCardSkeleton } from '../../components/listings/PropertyCardSkeleton'
import { PropertyMap } from '../../components/listings/PropertyMap'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Pagination } from '../../components/ui/Pagination'
import { useAsync } from '../../hooks/useAsync'
import { useFilters } from '../../hooks/useFilters'
import { useMediaQuery, breakpoints } from '../../hooks/useMediaQuery'
import { propertiesService } from '../../services/propertiesService'
import { filterProperties } from '../../utils/filterProperties'

const PAGE_SIZE = 9

export function BrowsePage() {
  const { data, loading, error, reload } = useAsync(() => propertiesService.list(), [])
  const { filters, setFilter, toggleAmenity, resetFilters } = useFilters()
  const isDesktop = useMediaQuery(breakpoints.lg)

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => filterProperties(data ?? [], filters), [data, filters])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
    setPage(1)
    setFilter(key, value)
  }

  const showMap = isDesktop || mobileView === 'map'
  const showList = isDesktop || mobileView === 'list'

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[260px_1fr_440px] lg:items-start">
        <FilterPanel
          filters={filters}
          setFilter={handleFilterChange}
          toggleAmenity={toggleAmenity}
          resetFilters={resetFilters}
          className="hidden lg:block"
        />

        <div className="min-w-0">
          <BrowseToolbar
            resultCount={filtered.length}
            sort={filters.sort}
            onSortChange={(sort) => setFilter('sort', sort)}
            view={view}
            onViewChange={setView}
            onOpenFilters={() => setFiltersOpen(true)}
            mobileView={mobileView}
            onMobileViewChange={setMobileView}
          />

          <div className="mt-4">
            <FilterChips filters={filters} setFilter={handleFilterChange} toggleAmenity={toggleAmenity} />
          </div>

          {showList && (
            <div className="mt-6">
              {error ? (
                <ErrorState onRetry={reload} />
              ) : loading ? (
                <div className={gridClasses(view)}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="No listings match your filters"
                  description="Try widening your budget or removing a filter."
                  action={
                    <button type="button" onClick={resetFilters} className="text-sm font-medium text-blue-500">
                      Reset filters
                    </button>
                  }
                />
              ) : (
                <>
                  <motion.div
                    layout
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                    className={gridClasses(view)}
                  >
                    {paged.map((property) => (
                      <motion.div
                        key={property.id}
                        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                      >
                        <PropertyCard
                          property={property}
                          view={view}
                          highlighted={hoveredId === property.id}
                          onMouseEnter={() => setHoveredId(property.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-8" />
                </>
              )}
            </div>
          )}
        </div>

        {showMap && (
          <div className={isDesktop ? 'sticky top-20 h-[calc(100vh-6rem)]' : 'h-[calc(100vh-14rem)]'}>
            <PropertyMap
              properties={filtered}
              selectedId={hoveredId}
              onHover={setHoveredId}
              className="h-full w-full"
            />
          </div>
        )}
      </div>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <FilterPanel filters={filters} setFilter={handleFilterChange} toggleAmenity={toggleAmenity} resetFilters={resetFilters} />
      </Drawer>
    </div>
  )
}

function gridClasses(view: 'grid' | 'list') {
  return view === 'grid' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-4'
}
