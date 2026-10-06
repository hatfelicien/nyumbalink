import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  /** Classes for the <select> itself; `className` sizes the wrapper so the chevron stays aligned. */
  selectClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, selectClassName, label, error, options, placeholder, id, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-navy-900 dark:text-white">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'h-11 w-full appearance-none rounded-xl border border-navy-700/15 bg-white px-4 pr-10 text-sm text-navy-900 transition-colors focus-visible:border-blue-400 dark:border-navy-700 dark:bg-navy-800 dark:text-white',
              error && 'border-rose-500 focus-visible:ring-rose-500',
              selectClassName,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-rose-500">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
