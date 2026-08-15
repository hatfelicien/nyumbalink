import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'btn-shine overflow-hidden bg-blue-500 text-white shadow-glow hover:bg-blue-400 hover:shadow-glow-lg',
        secondary:
          'border border-navy-700/20 bg-white text-navy-900 hover:border-blue-400 hover:text-blue-500 dark:border-navy-700 dark:bg-navy-800 dark:text-white dark:hover:border-blue-400',
        ghost:
          'text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
        danger: 'bg-rose-500 text-white hover:bg-rose-500/90',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>

export interface ButtonProps extends NativeButtonProps, VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {variant === 'primary' && <span className="shine-sweep" aria-hidden="true" />}
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          icon
        )}
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
