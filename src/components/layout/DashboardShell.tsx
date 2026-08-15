import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { LanguageToggle } from './LanguageToggle'
import type { SidebarLink } from './Sidebar'
import { Sidebar } from './Sidebar'
import { SkipToContent } from './SkipToContent'
import { ThemeToggle } from './ThemeToggle'

export interface DashboardShellProps {
  links: SidebarLink[]
  title: string
  children: ReactNode
  headerExtra?: ReactNode
}

export function DashboardShell({ links, title, children, headerExtra }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    setDrawerOpen(false)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-navy-950">
      <SkipToContent />
      <Sidebar links={links} onLogout={handleLogout} className="fixed inset-y-0 hidden lg:flex" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="">
        <Sidebar links={links} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} className="-mx-5 -my-5 w-auto" />
      </Drawer>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-700/10 bg-white/80 px-4 backdrop-blur-md dark:border-navy-700 dark:bg-navy-950/80 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open dashboard menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <h1 className="text-lg font-semibold text-navy-900 dark:text-white">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {headerExtra}
            <LanguageToggle />
            <ThemeToggle />
            {user && <Avatar name={user.name} src={user.avatar} size="sm" />}
            <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout} className="hidden lg:inline-flex">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
