import { Star } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface RatingProps {
  value: number
  count?: number
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

export function Rating({ value, count, size = 'sm', className }: RatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)} role="img" aria-label={`Rated ${value} out of 5`}>
      <Star className={cn(sizeClasses[size], 'fill-amber-500 text-amber-500')} aria-hidden="true" />
      <span className="text-sm font-medium text-navy-900 dark:text-white">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-sm text-slate-500">({count})</span>}
    </div>
  )
}
