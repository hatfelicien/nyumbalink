import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  interactive?: boolean
}

export function Card({ className, padded = true, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-navy-700/10 bg-white shadow-soft dark:border-navy-700 dark:bg-navy-800 dark:shadow-soft-dark',
        padded && 'p-6',
        interactive && 'transition-shadow hover:shadow-glow',
        className,
      )}
      {...props}
    />
  )
}
