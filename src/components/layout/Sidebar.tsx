import type { ReactNode } from 'react'
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
  /** Links sharing a section are grouped under a small heading. */
  section?: string
}

export interface SidebarProps {
  links: SidebarLink[]
  onNavigate?: () => void
  onLogout?: () => void
  /** Extra content above the log-out button, e.g. preferences in the mobile drawer. */
  footer?: ReactNode
  /** In the mobile drawer the whole panel scrolls, rather than just the link list. */
  inDrawer?: boolean
  className?: string
}

export function Sidebar({ links, onNavigate, onLogout, footer, inDrawer = false, className }: SidebarProps) {
  return (
    <div className={cn('flex h-full w-64 flex-col bg-navy-900 px-4 py-6 text-white', className)}>
      <div className="px-2">
        <Logo inverted />
      </div>

      <nav className={cn('mt-8 flex flex-1 flex-col gap-0.5', !inDrawer && 'overflow-y-auto scrollbar-none')} aria-label="Dashboard">
        {links.map((link, index) => {
          const startsSection = link.section && link.section !== links[index - 1]?.section
          return (
            <div key={link.to}>
              {startsSection && (
                <p className="mb-1.5 mt-5 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">{link.section}</p>
              )}
              <NavLink
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
                <link.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                {link.label}
              </NavLink>
            </div>
          )
        })}
      </nav>

      {footer}

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Log out
        </button>
      )}
    </div>
  )
}
