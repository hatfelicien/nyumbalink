import { LayoutGrid, List, Map, SlidersHorizontal } from 'lucide-react'
import type { FilterState } from '../../types'
import { SORT_OPTIONS } from '../../utils/constants'
import { Select } from '../ui/Select'
import { cn } from '../../utils/cn'

export interface BrowseToolbarProps {
  resultCount: number
  sort: FilterState['sort']
  onSortChange: (sort: FilterState['sort']) => void
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
  onOpenFilters: () => void
  mobileView?: 'list' | 'map'
  onMobileViewChange?: (view: 'list' | 'map') => void
}

export function BrowseToolbar({
  resultCount,
  sort,
  onSortChange,
  view,
  onViewChange,
  onOpenFilters,
  mobileView,
  onMobileViewChange,
}: BrowseToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex items-center gap-2 rounded-lg border border-navy-700/15 px-3.5 py-2 text-sm font-medium text-navy-900 dark:border-navy-700 dark:text-white lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
        </button>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-navy-900 dark:text-white">{resultCount}</span> results
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Select
          aria-label="Sort by"
          options={[...SORT_OPTIONS]}
          value={sort}
          onChange={(e) => onSortChange(e.target.value as FilterState['sort'])}
          className="h-10 w-44"
        />

        <div className="hidden items-center rounded-lg border border-navy-700/15 p-0.5 dark:border-navy-700 sm:flex">
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            className={cn('rounded-md p-1.5', view === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-500')}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
            className={cn('rounded-md p-1.5', view === 'list' ? 'bg-blue-500 text-white' : 'text-slate-500')}
          >
            <List className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {onMobileViewChange && (
          <div className="flex items-center rounded-lg border border-navy-700/15 p-0.5 dark:border-navy-700 lg:hidden">
            <button
              type="button"
              onClick={() => onMobileViewChange('list')}
              aria-pressed={mobileView === 'list'}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-xs font-medium',
                mobileView === 'list' ? 'bg-blue-500 text-white' : 'text-slate-500',
              )}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => onMobileViewChange('map')}
              aria-pressed={mobileView === 'map'}
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium',
                mobileView === 'map' ? 'bg-blue-500 text-white' : 'text-slate-500',
              )}
            >
              <Map className="h-3.5 w-3.5" aria-hidden="true" />
              Map
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
