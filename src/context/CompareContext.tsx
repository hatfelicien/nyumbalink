import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS, storage } from '../utils/storage'

/** Three columns is what still fits side by side on a phone in landscape. */
export const MAX_COMPARE = 3

interface CompareContextValue {
  compareIds: string[]
  isComparing: (propertyId: string) => boolean
  /** Returns false when the list is full and the listing could not be added. */
  toggleCompare: (propertyId: string) => boolean
  clearCompare: () => void
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>(() => storage.get<string[]>(STORAGE_KEYS.compare) ?? [])

  const toggleCompare = useCallback(
    (propertyId: string) => {
      const selected = compareIds.includes(propertyId)
      if (!selected && compareIds.length >= MAX_COMPARE) return false
      const next = selected ? compareIds.filter((id) => id !== propertyId) : [...compareIds, propertyId]
      setCompareIds(next)
      storage.set(STORAGE_KEYS.compare, next)
      return true
    },
    [compareIds],
  )

  const clearCompare = useCallback(() => {
    setCompareIds([])
    storage.remove(STORAGE_KEYS.compare)
  }, [])

  const isComparing = useCallback((propertyId: string) => compareIds.includes(propertyId), [compareIds])

  const value = useMemo(
    () => ({ compareIds, isComparing, toggleCompare, clearCompare }),
    [compareIds, isComparing, toggleCompare, clearCompare],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used within a CompareProvider')
  return context
}
