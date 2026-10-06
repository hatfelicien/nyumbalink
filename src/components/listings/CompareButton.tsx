import { Scale } from 'lucide-react'
import { MAX_COMPARE, useCompare } from '../../context/CompareContext'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../utils/cn'

export interface CompareButtonProps {
  propertyId: string
  /** 'icon' sits on top of card photos; 'label' is the full-width version for the detail page. */
  variant?: 'icon' | 'label'
  className?: string
}

export function CompareButton({ propertyId, variant = 'icon', className }: CompareButtonProps) {
  const { isComparing, toggleCompare } = useCompare()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const selected = isComparing(propertyId)

  function handleClick(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (!toggleCompare(propertyId)) {
      showToast(`You can compare up to ${MAX_COMPARE} homes`, { description: 'Remove one to add another.', variant: 'warning' })
    }
  }

  if (variant === 'label') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={selected}
        className={cn(
          'flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors active:scale-95',
          selected
            ? 'border-blue-500 bg-blue-500/10 text-blue-500'
            : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
          className,
        )}
      >
        <Scale className="h-4 w-4" aria-hidden="true" />
        {t('property.compare')}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={selected ? 'Remove from comparison' : 'Add to comparison'}
      aria-pressed={selected}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full shadow-soft backdrop-blur transition-colors',
        selected ? 'bg-blue-500 text-white' : 'bg-white/90 text-navy-900 hover:bg-white dark:bg-navy-900/80 dark:text-white',
        className,
      )}
    >
      <Scale className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}
