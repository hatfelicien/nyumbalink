import { useCallback, useState } from 'react'
import type { SavedSearch } from '../types'
import { generateId } from '../utils/id'
import { STORAGE_KEYS, storage } from '../utils/storage'

/** Saved searches live in this browser, like saved listings, so they work before signing up. */
export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>(() => storage.get<SavedSearch[]>(STORAGE_KEYS.savedSearches) ?? [])

  const persist = useCallback((update: (current: SavedSearch[]) => SavedSearch[]) => {
    setSearches((current) => {
      const next = update(current)
      storage.set(STORAGE_KEYS.savedSearches, next)
      return next
    })
  }, [])

  const saveSearch = useCallback(
    (name: string, query: string) => {
      const now = new Date().toISOString()
      persist((current) => [{ id: generateId('search'), name, query, alerts: true, createdAt: now, lastCheckedAt: now }, ...current])
    },
    [persist],
  )

  const removeSearch = useCallback((id: string) => persist((current) => current.filter((s) => s.id !== id)), [persist])

  const toggleAlerts = useCallback(
    (id: string) => persist((current) => current.map((s) => (s.id === id ? { ...s, alerts: !s.alerts } : s))),
    [persist],
  )

  /** Clears the "new" badge by moving the comparison point to now. */
  const markChecked = useCallback(
    (id: string) => persist((current) => current.map((s) => (s.id === id ? { ...s, lastCheckedAt: new Date().toISOString() } : s))),
    [persist],
  )

  return { searches, saveSearch, removeSearch, toggleAlerts, markChecked }
}
