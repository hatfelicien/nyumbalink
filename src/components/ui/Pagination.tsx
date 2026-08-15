import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

function getPageList(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages = new Set([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('ellipsis')
    result.push(p)
  })
  return result
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-900 transition-colors hover:bg-navy-900/5 disabled:pointer-events-none disabled:opacity-40 dark:text-white dark:hover:bg-white/10"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {getPageList(page, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-500">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              item === page
                ? 'bg-blue-500 text-white'
                : 'text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-900 transition-colors hover:bg-navy-900/5 disabled:pointer-events-none disabled:opacity-40 dark:text-white dark:hover:bg-white/10"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
