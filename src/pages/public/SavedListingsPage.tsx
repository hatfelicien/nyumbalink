import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BellOff, Heart, Search, Trash2 } from 'lucide-react'
import { PropertyCard } from '../../components/listings/PropertyCard'
import { PropertyCardSkeleton } from '../../components/listings/PropertyCardSkeleton'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Tabs } from '../../components/ui/Tabs'
import { useFavorites } from '../../context/FavoritesContext'
import { useAsync } from '../../hooks/useAsync'
import { parseFilters } from '../../hooks/useFilters'
import { useSavedSearches } from '../../hooks/useSavedSearches'
import { propertiesService } from '../../services/propertiesService'
import type { Property, SavedSearch } from '../../types'
import { filterProperties } from '../../utils/filterProperties'
import { formatDate } from '../../utils/format'

function matchesFor(search: SavedSearch, properties: Property[]) {
  const matches = filterProperties(properties, parseFilters(new URLSearchParams(search.query)))
  const checkedAt = new Date(search.lastCheckedAt).getTime()
  return { total: matches.length, fresh: matches.filter((p) => new Date(p.createdAt).getTime() > checkedAt).length }
}

export function SavedListingsPage() {
  const { favoriteIds } = useFavorites()
  const { searches, removeSearch, toggleAlerts, markChecked } = useSavedSearches()
  const { data, loading, error, reload } = useAsync(() => propertiesService.list(), [])
  const [tab, setTab] = useState<'listings' | 'searches'>('listings')

  const properties = data ?? []
  const saved = properties.filter((property) => favoriteIds.includes(property.id))

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">Saved</h1>
      <p className="mt-2 text-slate-500">Listings and searches you have saved on this device.</p>

      <Tabs
        className="mt-6"
        items={[
          { value: 'listings', label: 'Listings', count: favoriteIds.length },
          { value: 'searches', label: 'Searches', count: searches.length },
        ]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      <div className="mt-8">
        {error ? (
          <ErrorState onRetry={reload} />
        ) : loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : tab === 'listings' ? (
          saved.length === 0 ? (
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
          )
        ) : searches.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No saved searches yet"
            description='Set your filters on the browse page, then tap "Save search" to be alerted when new homes match.'
            action={
              <Link to="/browse">
                <Button>Browse listings</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {searches.map((search) => {
              const { total, fresh } = matchesFor(search, properties)
              return (
                <li
                  key={search.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-navy-700/10 bg-white p-4 dark:border-navy-700 dark:bg-navy-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium capitalize text-navy-900 dark:text-white">{search.name}</p>
                      {search.alerts && fresh > 0 && <Badge variant="success">{fresh} new</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {total} matching listing{total === 1 ? '' : 's'} · saved {formatDate(search.createdAt)}
                    </p>
                  </div>
                  <Link to={`/browse?${search.query}`} onClick={() => markChecked(search.id)}>
                    <Button size="sm" variant="secondary">
                      View results
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={search.alerts ? 'Turn alerts off' : 'Turn alerts on'}
                    aria-pressed={search.alerts}
                    onClick={() => toggleAlerts(search.id)}
                  >
                    {search.alerts ? <Bell className="h-4 w-4 text-blue-500" /> : <BellOff className="h-4 w-4 text-slate-500" />}
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Delete saved search" onClick={() => removeSearch(search.id)}>
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
