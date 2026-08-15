import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, LayoutDashboard, LogOut, Map, Menu, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../context/FavoritesContext'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { cn } from '../../utils/cn'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { to: '/browse', label: 'Browse' },
  { to: '/map', label: 'Map search' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const dashboardPathByRole: Record<string, string> = {
  admin: '/admin',
  owner: '/owner',
}

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const { favoriteIds } = useFavorites()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    setDrawerOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy-700/10 bg-white/80 backdrop-blur-md dark:border-navy-700 dark:bg-navy-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-blue-500'
                    : 'text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/saved"
            aria-label="Saved listings"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10"
          >
            <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
            {favoriteIds.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {favoriteIds.length}
              </span>
            )}
          </Link>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3 pl-2">
              {dashboardPathByRole[user.role] && (
                <Link to={dashboardPathByRole[user.role]}>
                  <Button variant="secondary" size="sm" icon={<LayoutDashboard className="h-4 w-4" />}>
                    Dashboard
                  </Button>
                </Link>
              )}
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menu">
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium',
                  isActive ? 'bg-blue-500/10 text-blue-500' : 'text-navy-900 dark:text-white',
                )
              }
            >
              {link.to === '/map' && <Map className="h-4 w-4" aria-hidden="true" />}
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/saved"
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium',
                isActive ? 'bg-blue-500/10 text-blue-500' : 'text-navy-900 dark:text-white',
              )
            }
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            Saved{favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ''}
          </NavLink>
        </nav>

        <div className="mt-6 flex items-center justify-between border-t border-navy-700/10 pt-4 dark:border-navy-700">
          <span className="text-sm font-medium text-slate-500">Appearance</span>
          <ThemeToggle />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {user ? (
            <>
              {dashboardPathByRole[user.role] && (
                <Link to={dashboardPathByRole[user.role]} onClick={() => setDrawerOpen(false)}>
                  <Button variant="secondary" className="w-full" icon={<LayoutDashboard className="h-4 w-4" />}>
                    Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="ghost" className="w-full" icon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setDrawerOpen(false)}>
                <Button variant="secondary" className="w-full" icon={<UserIcon className="h-4 w-4" />}>
                  Log in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setDrawerOpen(false)}>
                <Button variant="primary" className="w-full">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </Drawer>
    </header>
  )
}
