import { LANGUAGES, useLanguage } from '../../context/LanguageContext'
import { cn } from '../../utils/cn'

export function LanguageToggle({ className }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage()
  const index = LANGUAGES.findIndex((l) => l.code === language)
  const current = LANGUAGES[index]
  const next = LANGUAGES[(index + 1) % LANGUAGES.length]

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Language: ${current.label}. Switch to ${next.label}`}
      title={`${current.label} → ${next.label}`}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-navy-900 transition-colors hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
        className,
      )}
    >
      {language.toUpperCase()}
    </button>
  )
}
