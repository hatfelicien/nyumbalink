import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { List, Map as MapIcon, SearchX } from 'lucide-react'
import { BrowseToolbar } from '../../components/listings/BrowseToolbar'
import { FilterChips } from '../../components/listings/FilterChips'
import { FilterPanel } from '../../components/listings/FilterPanel'
import { PropertyCard } from '../../components/listings/PropertyCard'
import { PropertyCardSkeleton } from '../../components/listings/PropertyCardSkeleton'
import { PropertyMap } from '../../components/listings/PropertyMap'
import { Button } from '../../components/ui/Button'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Pagination } from '../../components/ui/Pagination'
import { useAsync } from '../../hooks/useAsync'
import { describeFilters, useFilters } from '../../hooks/useFilters'
import { useSavedSearches } from '../../hooks/useSavedSearches'
import { useToast } from '../../hooks/useToast'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { propertiesService } from '../../services/propertiesService'
import { filterProperties } from '../../utils/filterProperties'

const PAGE_SIZE = 12

/** Below this width the map would squeeze the results, so it becomes a list/map toggle instead of a docked column. */
const DOCKED_MAP_QUERY = '(min-width: 1440px)'

export function BrowsePage() {
  const { data, loading, error, reload } = useAsync(() => propertiesService.list(), [])
  const { filters, setFilter, setFilters, toggleAmenity, resetFilters } = useFilters()
  const mapDocked = useMediaQuery(DOCKED_MAP_QUERY)
  const [searchParams] = useSearchParams()
  const { searches, saveSearch } = useSavedSearches()
  const { showToast } = useToast()

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [display, setDisplay] = useState<'list' | 'map'>('list')
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

  function handleFiltersChange(patch: Partial<typeof filters>) {
    setPage(1)
    setFilters(patch)
  }

  function handleReset() {
    setPage(1)
    resetFilters()
  }

  function changePage(next: number) {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaveSearch() {
    const params = new URLSearchParams(searchParams)
    params.delete('sort')
    const query = params.toString()
    if (searches.some((s) => s.query === query)) {
      showToast('Search already saved', { description: 'Find it under Saved.', variant: 'info' })
      return
    }
    saveSearch(describeFilters(filters), query)
    showToast('Search saved', { description: 'New matching listings will be flagged under Saved → Searches.', variant: 'success' })
  }

  const showMap = mapDocked || display === 'map'
  const showList = mapDocked || display === 'list'

  const filterPanelProps = {
    filters,
    setFilter: handleFilterChange,
    setFilters: handleFiltersChange,
    toggleAmenity,
    resetFilters: handleReset,
  }

  return (
    <div className="mx-auto max-w-[1760px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8 min-[1440px]:grid-cols-[18rem_minmax(0,1fr)_minmax(24rem,32%)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7.5rem)] overflow-y-auto rounded-2xl border border-navy-700/10 bg-white p-5 shadow-sm scrollbar-none dark:border-navy-700 dark:bg-navy-800">
            <FilterPanel {...filterPanelProps} />
          </div>
        </aside>

        <div className="min-w-0">
          <BrowseToolbar
            resultCount={filtered.length}
            loading={loading}
            sort={filters.sort}
            onSortChange={(sort) => setFilter('sort', sort)}
            view={view}
            onViewChange={setView}
            onOpenFilters={() => setFiltersOpen(true)}
            onSaveSearch={handleSaveSearch}
            display={mapDocked ? undefined : display}
            onDisplayChange={mapDocked ? undefined : setDisplay}
          />

          <FilterChips {...filterPanelProps} className="mt-4" />

          {showList && (
            <div className="mt-5">
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
                  icon={SearchX}
                  title="No listings match your filters"
                  description="Try widening your budget or removing a filter."
                  action={
                    <Button variant="secondary" onClick={handleReset}>
                      Reset filters
                    </Button>
                  }
                />
              ) : (
                <>
                  <motion.div
                    key={`${page}-${view}`}
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                    className={gridClasses(view)}
                  >
                    {paged.map((property) => (
                      <motion.div
                        key={property.id}
                        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                        className="h-full"
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
                  <Pagination page={page} totalPages={totalPages} onChange={changePage} className="mt-10" />
                </>
              )}
            </div>
          )}

          {showMap && !mapDocked && (
            <div className="mt-5 h-[calc(100dvh-15rem)] min-h-[22rem] overflow-hidden rounded-2xl border border-navy-700/10 dark:border-navy-700 md:h-[calc(100dvh-12rem)]">
              <PropertyMap properties={filtered} selectedId={hoveredId} onHover={setHoveredId} className="h-full w-full" />
            </div>
          )}
        </div>

        {mapDocked && (
          <div className="sticky top-24 h-[calc(100dvh-7.5rem)] overflow-hidden rounded-2xl border border-navy-700/10 shadow-sm dark:border-navy-700">
            <PropertyMap properties={filtered} selectedId={hoveredId} onHover={setHoveredId} className="h-full w-full" />
          </div>
        )}
      </div>

      {!mapDocked && (
        <button
          type="button"
          onClick={() => setDisplay(display === 'list' ? 'map' : 'list')}
          className="bottom-tabbar fixed left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition-transform active:scale-95 dark:bg-white dark:text-navy-900 md:hidden"
        >
          {display === 'list' ? <MapIcon className="h-4 w-4" aria-hidden="true" /> : <List className="h-4 w-4" aria-hidden="true" />}
          {display === 'list' ? 'Map' : 'List'}
        </button>
      )}

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={() => setFiltersOpen(false)} className="flex-[2]">
              Show {filtered.length} {filtered.length === 1 ? 'home' : 'homes'}
            </Button>
          </div>
        }
      >
        <FilterPanel {...filterPanelProps} showHeader={false} />
      </Drawer>
    </div>
  )
}

function gridClasses(view: 'grid' | 'list') {
  return view === 'grid'
    ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]'
    : 'flex flex-col gap-4'
}
