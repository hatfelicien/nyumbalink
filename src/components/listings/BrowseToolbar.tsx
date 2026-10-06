import { BellPlus, LayoutGrid, List, Map, SlidersHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FilterState } from '../../types'
import { SORT_OPTIONS } from '../../utils/constants'
import { Select } from '../ui/Select'
import { cn } from '../../utils/cn'

export interface BrowseToolbarProps {
  resultCount: number
  loading?: boolean
  sort: FilterState['sort']
  onSortChange: (sort: FilterState['sort']) => void
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
  onOpenFilters: () => void
  onSaveSearch?: () => void
  /** Omitted when the map is docked beside the results and no toggle is needed. */
  display?: 'list' | 'map'
  onDisplayChange?: (display: 'list' | 'map') => void
}

function SegmentButton({
  active,
  onClick,
  icon: Icon,
  label,
  showLabel,
}: {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
  showLabel?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={showLabel ? undefined : label}
      title={label}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-all',
        active ? 'bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white' : 'text-slate-500 hover:text-navy-900 dark:hover:text-white',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {showLabel && label}
    </button>
  )
}

const pillButton =
  'flex h-10 items-center gap-2 rounded-xl border border-navy-700/15 bg-white px-3.5 text-sm font-medium text-navy-900 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-navy-700 dark:bg-navy-800 dark:text-white'

export function BrowseToolbar({
  resultCount,
  loading,
  sort,
  onSortChange,
  view,
  onViewChange,
  onOpenFilters,
  onSaveSearch,
  display,
  onDisplayChange,
}: BrowseToolbarProps) {
  return (
    <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-semibold text-navy-900 dark:text-white sm:text-2xl">Homes in Kigali</h1>
        <p className="text-sm text-slate-500" aria-live="polite">
          {loading ? 'Loading…' : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`}
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button type="button" onClick={onOpenFilters} className={cn(pillButton, 'shrink-0 lg:hidden')}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
        </button>

        {onSaveSearch && (
          <button
            type="button"
            onClick={onSaveSearch}
            className={cn(pillButton, 'shrink-0 max-sm:w-10 max-sm:justify-center max-sm:px-0')}
            title="Save this search and get alerts"
            aria-label="Save search"
          >
            <BellPlus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Save search</span>
          </button>
        )}

        <Select
          aria-label="Sort by"
          options={[...SORT_OPTIONS]}
          value={sort}
          onChange={(e) => onSortChange(e.target.value as FilterState['sort'])}
          className="w-40 shrink-0 sm:w-44"
          selectClassName="h-10"
        />

        {(display === undefined || display === 'list') && (
          <div className="hidden shrink-0 items-center rounded-xl bg-navy-900/5 p-1 dark:bg-white/10 sm:flex">
            <SegmentButton active={view === 'grid'} onClick={() => onViewChange('grid')} icon={LayoutGrid} label="Grid view" />
            <SegmentButton active={view === 'list'} onClick={() => onViewChange('list')} icon={List} label="List view" />
          </div>
        )}

        {display && onDisplayChange && (
          // Phones get a floating toggle above the tab bar instead (see BrowsePage).
          <div className="hidden shrink-0 items-center rounded-xl bg-navy-900/5 p-1 dark:bg-white/10 md:flex">
            <SegmentButton active={display === 'list'} onClick={() => onDisplayChange('list')} icon={List} label="List" showLabel />
            <SegmentButton active={display === 'map'} onClick={() => onDisplayChange('map')} icon={Map} label="Map" showLabel />
          </div>
        )}
      </div>
    </div>
  )
}
