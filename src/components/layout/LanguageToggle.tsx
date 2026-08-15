import { useLanguage } from '../../context/LanguageContext'
import { cn } from '../../utils/cn'

export function LanguageToggle({ className }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === 'en' ? 'Switch to Kinyarwanda' : 'Switch to English'}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-navy-900 transition-colors hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
        className,
      )}
    >
      {language === 'en' ? 'RW' : 'EN'}
    </button>
  )
}
