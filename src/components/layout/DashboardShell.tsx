import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu } from 'lucide-react'
import { useLogout } from '../../hooks/useLogout'
import { UserMenu } from '../account/UserMenu'
import { Drawer } from '../ui/Drawer'
import { LanguageToggle } from './LanguageToggle'
import type { MobileTab } from './MobileTabBar'
import { MobileTabBar } from './MobileTabBar'
import { PreferencesPanel } from './PreferencesPanel'
import type { SidebarLink } from './Sidebar'
import { Sidebar } from './Sidebar'
import { SkipToContent } from './SkipToContent'
import { ThemeToggle } from './ThemeToggle'

export interface DashboardShellProps {
  links: SidebarLink[]
  /** The four destinations pinned to the phone tab bar; a "More" tab opening the full menu is added automatically. */
  mobileTabs: MobileTab[]
  title: string
  children: ReactNode
  headerExtra?: ReactNode
}

export function DashboardShell({ links, mobileTabs, title, children, headerExtra }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const handleLogout = useLogout()
  const location = useLocation()
  const { pathname } = location

  // Close the menu once a navigation has committed, never in the same render as the route
  // change: that combination leaves Framer Motion's exit animation stuck and the drawer
  // open over the new page (the same issue documented in AnimatedOutlet).
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.key])

  const tabs: MobileTab[] = [...mobileTabs, { label: 'More', icon: Menu, onClick: () => setDrawerOpen(true) }]

  return (
    <div className="flex min-h-dvh bg-slate-50 dark:bg-navy-950">
      <SkipToContent />
      <Sidebar links={links} onLogout={handleLogout} className="fixed inset-y-0 z-30 hidden lg:flex" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} side="left" bare>
        <Sidebar
          links={links}
          onLogout={handleLogout}
          inDrawer
          className="h-auto min-h-full w-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          footer={
            // The sidebar is always navy, so the preferences render with their dark-mode styles.
            <div className="dark mt-4 space-y-4 rounded-2xl bg-white/5 p-4">
              <PreferencesPanel />
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-white"
              >
                Back to the website
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          }
        />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-navy-700/10 bg-white/80 px-4 backdrop-blur-xl dark:border-navy-700 dark:bg-navy-950/80 sm:px-6 md:h-16 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open dashboard menu"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10 md:flex lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <h1 className="truncate text-base font-semibold text-navy-900 dark:text-white sm:text-lg">{title}</h1>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {headerExtra}
            <div className="hidden items-center gap-1 md:flex">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <UserMenu showName className="ml-1" />
          </div>
        </header>

        <main id="main-content" className="pb-tabbar flex-1 px-4 pt-4 sm:px-6 sm:pt-6 lg:p-8">
          <div className="mx-auto w-full max-w-[90rem]">{children}</div>
        </main>
      </div>

      <MobileTabBar tabs={tabs} hideFrom="lg" pathname={pathname} />
    </div>
  )
}
