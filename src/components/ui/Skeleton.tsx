import { cn } from '../../utils/cn'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'block' | 'circle'
}

export function Skeleton({ className, variant = 'block' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'skeleton',
        variant === 'text' && 'h-4 rounded-md',
        variant === 'block' && 'rounded-xl',
        variant === 'circle' && 'rounded-full',
        className,
      )}
    />
  )
}
