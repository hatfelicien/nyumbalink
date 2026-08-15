import { TriangleAlert } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10">
        <TriangleAlert className="h-6 w-6 text-rose-500" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-navy-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
