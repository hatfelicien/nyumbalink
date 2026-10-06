import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface MobileTab {
  label: string
  icon: LucideIcon
  /** A route to link to; omit and pass `onClick` for a tab that opens something instead (e.g. "More"). */
  to?: string
  end?: boolean
  onClick?: () => void
  /** Small count shown on the icon, e.g. unread messages. */
  badge?: number
  /** Replaces the icon, e.g. with the signed-in user's avatar. */
  render?: (active: boolean) => ReactNode
  /** Treat the tab as active for these extra path prefixes too. */
  activePrefixes?: string[]
}

export interface MobileTabBarProps {
  tabs: MobileTab[]
  /** Tailwind breakpoint prefix from which the bar is hidden (the desktop navigation takes over). */
  hideFrom: 'md' | 'lg'
  pathname: string
  className?: string
}

function isActive(tab: MobileTab, pathname: string) {
  if (!tab.to) return false
  const matches = (prefix: string) => (prefix === '/' ? pathname === '/' : pathname === prefix || pathname.startsWith(`${prefix}/`))
  if (tab.end ? pathname === tab.to : matches(tab.to)) return true
  return (tab.activePrefixes ?? []).some(matches)
}

/**
 * Instagram-style navigation for phones: a fixed bar of icons within thumb reach. The
 * active tab gets a filled pill behind its icon so the state reads at a glance.
 */
export function MobileTabBar({ tabs, hideFrom, pathname, className }: MobileTabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-navy-700/10 bg-white/90 backdrop-blur-xl print:hidden dark:border-navy-700 dark:bg-navy-950/90',
        hideFrom === 'md' ? 'md:hidden' : 'lg:hidden',
        className,
      )}
    >
      <ul className="mx-auto flex h-[4.25rem] max-w-lg items-stretch justify-around px-1">
        {tabs.map((tab) => {
          const active = isActive(tab, pathname)
          const content = (
            <>
              <span className="relative flex h-8 w-12 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId={`tab-pill-${hideFrom}`}
                    className="absolute inset-0 rounded-full bg-blue-500/10 dark:bg-blue-400/15"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                {tab.render ? (
                  <span className="relative">{tab.render(active)}</span>
                ) : (
                  <tab.icon className="relative h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.9} aria-hidden="true" />
                )}
                {!!tab.badge && (
                  <span className="absolute -top-0.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-navy-950">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </span>
              <span className={cn('text-[11px] leading-none', active ? 'font-semibold' : 'font-medium')}>{tab.label}</span>
            </>
          )
          const itemClass = cn(
            'tap-highlight-none flex h-full w-full flex-col items-center justify-center gap-1 transition-colors active:scale-95',
            active ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 hover:text-navy-900 dark:hover:text-white',
          )

          return (
            <li key={tab.label} className="flex-1">
              {tab.to ? (
                <Link to={tab.to} className={itemClass} aria-current={active ? 'page' : undefined}>
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={tab.onClick} className={itemClass}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
