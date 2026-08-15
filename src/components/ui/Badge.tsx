import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-navy-900/5 text-navy-900 dark:bg-white/10 dark:text-white',
        brand: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
        success: 'bg-emerald-500/10 text-emerald-500',
        pending: 'bg-amber-500/10 text-amber-500',
        danger: 'bg-rose-500/10 text-rose-500',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}
