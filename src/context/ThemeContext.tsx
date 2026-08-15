import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS, storage } from '../utils/storage'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always starts in light mode regardless of OS/browser preference. A manual
  // toggle is persisted and wins on future loads.
  const [theme, setTheme] = useState<Theme>(() => storage.get<Theme>(STORAGE_KEYS.theme) ?? 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      storage.set(STORAGE_KEYS.theme, next)
      return next
    })
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
