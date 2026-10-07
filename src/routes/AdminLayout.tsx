import { useLocation } from 'react-router-dom'
import { BadgeCheck, Building2, CircleUserRound, ClipboardList, Flag, LayoutGrid, MessageSquareWarning, Settings, UserCog, Users } from 'lucide-react'
import { DashboardShell } from '../components/layout/DashboardShell'
import type { MobileTab } from '../components/layout/MobileTabBar'
import type { SidebarLink } from '../components/layout/Sidebar'
import { AdminNotificationBell } from '../components/dashboard/AdminNotificationBell'
import { AnimatedOutlet } from './AnimatedOutlet'

const LINKS: SidebarLink[] = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/verification', label: 'Verification', icon: BadgeCheck, section: 'Trust & safety' },
  { to: '/admin/reports', label: 'Reports & disputes', icon: Flag, section: 'Trust & safety' },
  { to: '/admin/reviews', label: 'Review moderation', icon: MessageSquareWarning, section: 'Trust & safety' },
  { to: '/admin/owners', label: 'Manage owners', icon: UserCog, section: 'Marketplace' },
  { to: '/admin/applications', label: 'Landlord applications', icon: ClipboardList, section: 'Marketplace' },
  { to: '/admin/properties', label: 'All properties', icon: Building2, section: 'Marketplace' },
  { to: '/admin/users', label: 'Manage users', icon: Users, section: 'Marketplace' },
  { to: '/admin/settings', label: 'Platform settings', icon: Settings, section: 'Platform' },
  { to: '/admin/profile', label: 'My profile', icon: CircleUserRound, section: 'Account' },
]

const MOBILE_TABS: MobileTab[] = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/verification', label: 'Verify', icon: BadgeCheck },
  { to: '/admin/reports', label: 'Reports', icon: Flag, activePrefixes: ['/admin/reviews'] },
  { to: '/admin/properties', label: 'Listings', icon: Building2 },
]

const TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/verification': 'Verification queue',
  '/admin/reports': 'Reports & disputes',
  '/admin/reviews': 'Review moderation',
  '/admin/owners': 'Manage owners',
  '/admin/applications': 'Landlord applications',
  '/admin/properties': 'All properties',
  '/admin/users': 'Manage users',
  '/admin/settings': 'Platform settings',
  '/admin/profile': 'Profile & settings',
}

export function AdminLayout() {
  const location = useLocation()

  return (
    <DashboardShell
      links={LINKS}
      mobileTabs={MOBILE_TABS}
      title={TITLES[location.pathname] ?? 'Admin dashboard'}
      headerExtra={<AdminNotificationBell />}
    >
      <AnimatedOutlet />
    </DashboardShell>
  )
}
