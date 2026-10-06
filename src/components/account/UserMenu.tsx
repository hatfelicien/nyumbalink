import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, KeyRound, LayoutDashboard, LogOut, MessagesSquare, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useLogout } from '../../hooks/useLogout'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'

export const PROFILE_PATH_BY_ROLE = { guest: '/profile', owner: '/owner/profile', admin: '/admin/profile' } as const
const HOME_PATH_BY_ROLE = { guest: '/account', owner: '/owner', admin: '/admin' } as const
const ROLE_LABEL = { guest: 'Tenant', owner: 'Landlord', admin: 'Administrator' } as const

function MenuItem({ to, icon: Icon, children }: { to: string; icon: LucideIcon; children: string }) {
  return (
    <Link
      to={to}
      role="menuitem"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy-900 transition-colors hover:bg-navy-900/5 focus-visible:bg-navy-900/5 dark:text-white dark:hover:bg-white/10"
    >
      <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
      {children}
    </Link>
  )
}

/** The signed-in user's avatar, opening a menu with their profile, home page and log out. */
export function UserMenu({ showName = false, className }: { showName?: boolean; className?: string }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const logout = useLogout()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close after a navigation commits rather than in the click handler — see the menu drawers in Navbar.
  useEffect(() => {
    setOpen(false)
  }, [location.key])

  useEffect(() => {
    if (!open) return
    function handlePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!user) return null

  const isTenant = user.role === 'guest'

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="flex items-center gap-2 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-navy-900/5 dark:hover:bg-white/10"
      >
        <Avatar name={user.name} src={user.avatar} size="sm" />
        {showName && (
          <span className="hidden max-w-[8rem] truncate text-sm font-medium text-navy-900 dark:text-white xl:block">
            {user.name.split(' ')[0]}
          </span>
        )}
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-slate-500 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Account"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-navy-700/10 bg-white p-1.5 shadow-soft dark:border-navy-700 dark:bg-navy-800"
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={user.name} src={user.avatar} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-blue-500 dark:text-blue-400">
                  {ROLE_LABEL[user.role]}
                </p>
              </div>
            </div>
            <div className="my-1 h-px bg-navy-700/10 dark:bg-navy-700" />
            <MenuItem to={PROFILE_PATH_BY_ROLE[user.role]} icon={UserRound}>
              Profile & settings
            </MenuItem>
            <MenuItem to={HOME_PATH_BY_ROLE[user.role]} icon={isTenant ? KeyRound : LayoutDashboard}>
              {isTenant ? t('nav.myRentals') : t('nav.dashboard')}
            </MenuItem>
            <MenuItem to={user.role === 'owner' ? '/owner/messages' : '/messages'} icon={MessagesSquare}>
              {t('nav.messages')}
            </MenuItem>
            <div className="my-1 h-px bg-navy-700/10 dark:bg-navy-700" />
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/10 focus-visible:bg-rose-500/10 dark:text-rose-400"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t('nav.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
