import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Building2,
  Heart,
  Home,
  Info,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Map,
  Menu,
  MessagesSquare,
  Scale,
  Search,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCompare } from '../../context/CompareContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAsync } from '../../hooks/useAsync'
import { useLogout } from '../../hooks/useLogout'
import { useNotificationItems } from '../../hooks/useNotificationItems'
import { chatService } from '../../services/chatService'
import { PROFILE_PATH_BY_ROLE, UserMenu } from '../account/UserMenu'
import { NotificationBell } from '../dashboard/NotificationBell'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { cn } from '../../utils/cn'
import { LanguageToggle } from './LanguageToggle'
import { Logo } from './Logo'
import type { MobileTab } from './MobileTabBar'
import { MobileTabBar } from './MobileTabBar'
import { PreferencesPanel } from './PreferencesPanel'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { to: '/browse', labelKey: 'nav.browse', wide: false },
  { to: '/map', labelKey: 'nav.map', wide: false },
  { to: '/about', labelKey: 'nav.about', wide: true },
  { to: '/contact', labelKey: 'nav.contact', wide: true },
] as const

const dashboardPathByRole: Record<string, string> = {
  admin: '/admin',
  owner: '/owner',
  guest: '/account',
}

const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', owner: 'Landlord', guest: 'Tenant' }

function IconLink({ to, label, icon: Icon, count }: { to: string; label: string; icon: LucideIcon; count?: number }) {
  return (
    <NavLink
      to={to}
      aria-label={count ? `${label} (${count})` : label}
      title={label}
      className={({ isActive }) =>
        cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors',
          isActive
            ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
            : 'text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
        )
      }
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      {!!count && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-navy-950">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </NavLink>
  )
}

function MenuLink({ to, icon: Icon, children }: { to: string; icon: LucideIcon; children: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' : 'text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {children}
    </NavLink>
  )
}

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user } = useAuth()
  const handleLogout = useLogout()
  const { favoriteIds } = useFavorites()
  const { compareIds } = useCompare()
  const { t } = useLanguage()
  const location = useLocation()
  const { pathname } = location
  const { items: notifications, markAllRead } = useNotificationItems()
  const isTenant = user?.role === 'guest'
  const dashboardPath = user ? dashboardPathByRole[user.role] : undefined
  const dashboardLabel = isTenant ? t('nav.myRentals') : t('nav.dashboard')
  const DashboardIcon = isTenant ? KeyRound : LayoutDashboard
  const { data: unreadCount } = useAsync(
    () => (user ? chatService.getUnreadCountForUser(user.id) : Promise.resolve(0)),
    [user?.id],
  )

  const closeDrawer = () => setDrawerOpen(false)

  // Close the menu once a navigation has committed, never in the same render as the route
  // change: that combination leaves Framer Motion's exit animation stuck and the drawer
  // open over the new page (the same issue documented in AnimatedOutlet).
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.key])

  const tabs: MobileTab[] = [
    { to: '/', end: true, label: 'Home', icon: Home },
    { to: '/browse', label: 'Explore', icon: Search, activePrefixes: ['/listings', '/compare'] },
    user
      ? { to: '/messages', label: t('nav.messages'), icon: MessagesSquare, badge: unreadCount ?? 0 }
      : { to: '/map', label: 'Map', icon: Map },
    { to: '/saved', label: t('nav.saved'), icon: Heart },
    user && dashboardPath
      ? {
          to: dashboardPath,
          label: isTenant ? 'Rentals' : 'Dashboard',
          icon: UserRound,
          activePrefixes: ['/agreements'],
          render: (active: boolean) => (
            <Avatar
              name={user.name}
              src={user.avatar}
              size="sm"
              className={cn('h-6 w-6 text-[10px] ring-2', active ? 'ring-blue-500' : 'ring-transparent')}
            />
          ),
        }
      : { to: '/login', label: t('nav.login'), icon: LogIn, activePrefixes: ['/register', '/forgot-password'] },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-navy-700/10 bg-white/80 backdrop-blur-xl print:hidden dark:border-navy-700 dark:bg-navy-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-16 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    link.wide && 'hidden lg:block',
                    isActive
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {t(link.labelKey)}
                    {isActive && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-blue-500" aria-hidden="true" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 md:flex">
              <IconLink to="/saved" label={t('nav.saved')} icon={Heart} count={favoriteIds.length} />
              {user && <IconLink to="/messages" label={t('nav.messages')} icon={MessagesSquare} count={unreadCount ?? 0} />}
            </div>
            {isTenant && (
              <NotificationBell
                items={notifications}
                viewAllHref="/account?tab=notifications"
                emptyLabel="No notifications yet."
                onOpen={markAllRead}
              />
            )}

            <div className="hidden items-center gap-1 lg:flex">
              <LanguageToggle />
              <ThemeToggle />
              {user ? (
                <div className="ml-2 flex items-center gap-2">
                  {dashboardPath && (
                    <Link to={dashboardPath}>
                      <Button variant="secondary" size="sm" icon={<DashboardIcon className="h-4 w-4" />}>
                        {dashboardLabel}
                      </Button>
                    </Link>
                  )}
                  <UserMenu showName />
                </div>
              ) : (
                <div className="ml-2 flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <Drawer open={drawerOpen} onClose={closeDrawer} title="Menu">
        <div className="flex h-full flex-col gap-6">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl bg-navy-900/[0.03] p-3 dark:bg-white/5">
              <Avatar name={user.name} src={user.avatar} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="w-full">{t('nav.signup')}</Button>
              </Link>
            </div>
          )}

          <nav className="flex flex-col gap-0.5" aria-label="Menu">
            {user && (
              <MenuLink to={PROFILE_PATH_BY_ROLE[user.role]} icon={UserRound}>
                Profile & settings
              </MenuLink>
            )}
            {dashboardPath && (
              <MenuLink to={dashboardPath} icon={DashboardIcon}>
                {dashboardLabel}
              </MenuLink>
            )}
            <MenuLink to="/map" icon={Map}>
              {t('nav.map')}
            </MenuLink>
            <MenuLink to="/compare" icon={Scale}>
              {`${t('nav.compare')}${compareIds.length ? ` (${compareIds.length})` : ''}`}
            </MenuLink>
            {user?.role !== 'owner' && user?.role !== 'admin' && (
              <MenuLink to="/become-an-owner" icon={Building2}>
                List your property
              </MenuLink>
            )}
            <MenuLink to="/about" icon={Info}>
              {t('nav.about')}
            </MenuLink>
            <MenuLink to="/contact" icon={Mail}>
              {t('nav.contact')}
            </MenuLink>
          </nav>

          <PreferencesPanel className="border-t border-navy-700/10 pt-5 dark:border-navy-700" />

          {user && (
            <Button
              variant="secondary"
              className="w-full border-rose-500/30 text-rose-600 hover:border-rose-500 hover:text-rose-600 dark:text-rose-400"
              icon={<LogOut className="h-4 w-4" />}
              onClick={handleLogout}
            >
              {t('nav.logout')}
            </Button>
          )}
        </div>
      </Drawer>

      <MobileTabBar tabs={tabs} hideFrom="md" pathname={pathname} />
    </>
  )
}
