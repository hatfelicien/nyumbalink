import { useState } from 'react'
import { cn } from '../../utils/cn'

export interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '')
  return initials.join('')
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [errored, setErrored] = useState(false)

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErrored(true)}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-blue-500/15 font-semibold text-blue-500 dark:text-blue-400',
        sizeClasses[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
