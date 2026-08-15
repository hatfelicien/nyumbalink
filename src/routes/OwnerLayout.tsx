import { useLocation } from 'react-router-dom'
import { Inbox, LayoutGrid, PlusCircle, Settings, SquareGanttChart } from 'lucide-react'
import { DashboardShell } from '../components/layout/DashboardShell'
import type { SidebarLink } from '../components/layout/Sidebar'
import { OwnerNotificationBell } from '../components/dashboard/OwnerNotificationBell'
import { AnimatedOutlet } from './AnimatedOutlet'

const LINKS: SidebarLink[] = [
  { to: '/owner', label: 'Overview', icon: SquareGanttChart, end: true },
  { to: '/owner/properties', label: 'My properties', icon: LayoutGrid },
  { to: '/owner/properties/new', label: 'Add property', icon: PlusCircle },
  { to: '/owner/enquiries', label: 'Enquiries', icon: Inbox },
  { to: '/owner/profile', label: 'Profile', icon: Settings },
]

const TITLES: Record<string, string> = {
  '/owner': 'Overview',
  '/owner/properties': 'My properties',
  '/owner/properties/new': 'Add property',
  '/owner/enquiries': 'Enquiries',
  '/owner/profile': 'Profile settings',
}

function resolveTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.endsWith('/edit')) return 'Edit property'
  return 'Owner dashboard'
}

export function OwnerLayout() {
  const location = useLocation()

  return (
    <DashboardShell links={LINKS} title={resolveTitle(location.pathname)} headerExtra={<OwnerNotificationBell />}>
      <AnimatedOutlet />
    </DashboardShell>
  )
}
