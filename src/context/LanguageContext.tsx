import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { en } from '../i18n/en'
import type { TranslationKey } from '../i18n/en'
import { fr } from '../i18n/fr'
import { rw } from '../i18n/rw'
import { STORAGE_KEYS, storage } from '../utils/storage'

export type Language = 'en' | 'rw' | 'fr'

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'fr', label: 'Français' },
]

const DICTIONARIES: Record<Language, Record<TranslationKey, string>> = { en, rw, fr }

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  /** Steps to the next language in `LANGUAGES`, wrapping around. */
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function loadLanguage(): Language {
  const stored = storage.get<Language>(STORAGE_KEYS.language)
  return stored && stored in DICTIONARIES ? stored : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(loadLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    storage.set(STORAGE_KEYS.language, next)
  }, [])

  const toggleLanguage = useCallback(() => {
    const index = LANGUAGES.findIndex((l) => l.code === language)
    setLanguage(LANGUAGES[(index + 1) % LANGUAGES.length].code)
  }, [language, setLanguage])

  const t = useCallback((key: TranslationKey) => DICTIONARIES[language][key] ?? en[key] ?? key, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
