import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { en } from '../i18n/en'
import type { TranslationKey } from '../i18n/en'
import { rw } from '../i18n/rw'
import { STORAGE_KEYS, storage } from '../utils/storage'

export type Language = 'en' | 'rw'

const DICTIONARIES: Record<Language, Record<TranslationKey, string>> = { en, rw }

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => storage.get<Language>(STORAGE_KEYS.language) ?? 'en')

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    storage.set(STORAGE_KEYS.language, next)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'rw' : 'en')
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
