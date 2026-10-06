import { useLocation } from 'react-router-dom'
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  Inbox,
  LayoutGrid,
  MessagesSquare,
  PlusCircle,
  Settings,
  SquareGanttChart,
  Users,
  Wrench,
} from 'lucide-react'
import { DashboardShell } from '../components/layout/DashboardShell'
import type { MobileTab } from '../components/layout/MobileTabBar'
import type { SidebarLink } from '../components/layout/Sidebar'
import { OwnerNotificationBell } from '../components/dashboard/OwnerNotificationBell'
import { AnimatedOutlet } from './AnimatedOutlet'

const LINKS: SidebarLink[] = [
  { to: '/owner', label: 'Overview', icon: SquareGanttChart, end: true },
  { to: '/owner/properties', label: 'My properties', icon: LayoutGrid, end: true, section: 'Listings' },
  { to: '/owner/properties/new', label: 'Add property', icon: PlusCircle, section: 'Listings' },
  { to: '/owner/verification', label: 'Verification', icon: BadgeCheck, section: 'Listings' },
  { to: '/owner/viewings', label: 'Viewings', icon: CalendarDays, section: 'Rentals' },
  { to: '/owner/applications', label: 'Applications', icon: FileText, section: 'Rentals' },
  { to: '/owner/tenants', label: 'Tenants & contracts', icon: Users, section: 'Rentals' },
  { to: '/owner/maintenance', label: 'Maintenance', icon: Wrench, section: 'Rentals' },
  { to: '/owner/enquiries', label: 'Enquiries', icon: Inbox, section: 'Inbox' },
  { to: '/owner/messages', label: 'Messages', icon: MessagesSquare, section: 'Inbox' },
  { to: '/owner/profile', label: 'Profile & settings', icon: Settings, section: 'Account' },
]

const MOBILE_TABS: MobileTab[] = [
  { to: '/owner', label: 'Overview', icon: SquareGanttChart, end: true },
  { to: '/owner/properties', label: 'Properties', icon: LayoutGrid, activePrefixes: ['/owner/verification'] },
  { to: '/owner/viewings', label: 'Rentals', icon: CalendarDays, activePrefixes: ['/owner/applications', '/owner/tenants', '/owner/maintenance'] },
  { to: '/owner/messages', label: 'Messages', icon: MessagesSquare, activePrefixes: ['/owner/enquiries'] },
]

const TITLES: Record<string, string> = {
  '/owner': 'Overview',
  '/owner/properties': 'My properties',
  '/owner/properties/new': 'Add property',
  '/owner/verification': 'Verification',
  '/owner/viewings': 'Viewings',
  '/owner/applications': 'Rental applications',
  '/owner/tenants': 'Tenants & contracts',
  '/owner/maintenance': 'Maintenance requests',
  '/owner/enquiries': 'Enquiries',
  '/owner/messages': 'Messages',
  '/owner/profile': 'Profile & settings',
}

function resolveTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.endsWith('/edit')) return 'Edit property'
  return 'Owner dashboard'
}

export function OwnerLayout() {
  const location = useLocation()

  return (
    <DashboardShell
      links={LINKS}
      mobileTabs={MOBILE_TABS}
      title={resolveTitle(location.pathname)}
      headerExtra={<OwnerNotificationBell />}
    >
      <AnimatedOutlet />
    </DashboardShell>
  )
}
