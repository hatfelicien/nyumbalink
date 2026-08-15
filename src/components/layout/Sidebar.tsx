import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Logo } from './Logo'

export interface SidebarLink {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export interface SidebarProps {
  links: SidebarLink[]
  onNavigate?: () => void
  onLogout?: () => void
  className?: string
}

export function Sidebar({ links, onNavigate, onLogout, className }: SidebarProps) {
  return (
    <div className={cn('flex h-full w-64 flex-col bg-navy-900 px-4 py-6 text-white', className)}>
      <div className="px-2">
        <Logo inverted />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Dashboard">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-blue-500 text-white shadow-glow' : 'text-white/70 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <link.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Log out
        </button>
      )}
    </div>
  )
}
