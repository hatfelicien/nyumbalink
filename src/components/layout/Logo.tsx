import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'flex items-center gap-2 text-lg font-bold tracking-tight',
        inverted ? 'text-white' : 'text-navy-900 dark:text-white',
        className,
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white shadow-glow">
        <Home className="h-5 w-5" aria-hidden="true" />
      </span>
      NyumbaLink
    </Link>
  )
}
