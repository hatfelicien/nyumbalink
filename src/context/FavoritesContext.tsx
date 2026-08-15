import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS, storage } from '../utils/storage'

interface FavoritesContextValue {
  favoriteIds: string[]
  isFavorite: (propertyId: string) => boolean
  toggleFavorite: (propertyId: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => storage.get<string[]>(STORAGE_KEYS.favorites) ?? [])

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(propertyId) ? current.filter((id) => id !== propertyId) : [...current, propertyId]
      storage.set(STORAGE_KEYS.favorites, next)
      return next
    })
  }, [])

  const isFavorite = useCallback((propertyId: string) => favoriteIds.includes(propertyId), [favoriteIds])

  const value = useMemo(() => ({ favoriteIds, isFavorite, toggleFavorite }), [favoriteIds, isFavorite, toggleFavorite])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider')
  return context
}
