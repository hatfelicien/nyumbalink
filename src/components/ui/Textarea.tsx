import { forwardRef, useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, rows = 4, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-navy-900 dark:text-white">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={!!error}
          className={cn(
            'w-full resize-y rounded-xl border border-navy-700/15 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-slate-500/70 transition-colors focus-visible:border-blue-400 dark:border-navy-700 dark:bg-navy-800 dark:text-white',
            error && 'border-rose-500 focus-visible:ring-rose-500',
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-sm text-rose-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
        ) : null}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
