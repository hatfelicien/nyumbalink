import { cn } from '../../utils/cn'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Accessible name; pass it when there is no visible label wired up with `aria-labelledby`. */
  label: string
  className?: string
}

export function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-blue-500' : 'bg-navy-900/15 dark:bg-white/15',
        className,
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}
