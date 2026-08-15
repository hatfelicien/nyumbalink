import { useCallback, useState } from 'react'
import { STORAGE_KEYS, storage } from '../utils/storage'

const MAX_RECENT = 8

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>(() => storage.get<string[]>(STORAGE_KEYS.recentlyViewed) ?? [])

  const recordView = useCallback((propertyId: string) => {
    setRecentIds((current) => {
      const next = [propertyId, ...current.filter((id) => id !== propertyId)].slice(0, MAX_RECENT)
      storage.set(STORAGE_KEYS.recentlyViewed, next)
      return next
    })
  }, [])

  return { recentIds, recordView }
}
