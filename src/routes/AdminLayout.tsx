import { useLocation } from 'react-router-dom'
import { Building2, ClipboardList, LayoutGrid, Settings, UserCog, Users } from 'lucide-react'
import { DashboardShell } from '../components/layout/DashboardShell'
import type { SidebarLink } from '../components/layout/Sidebar'
import { AdminNotificationBell } from '../components/dashboard/AdminNotificationBell'
import { AnimatedOutlet } from './AnimatedOutlet'

const LINKS: SidebarLink[] = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/owners', label: 'Manage owners', icon: UserCog },
  { to: '/admin/applications', label: 'Owner applications', icon: ClipboardList },
  { to: '/admin/properties', label: 'All properties', icon: Building2 },
  { to: '/admin/users', label: 'Manage users', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

const TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/owners': 'Manage owners',
  '/admin/applications': 'Owner applications',
  '/admin/properties': 'All properties',
  '/admin/users': 'Manage users',
  '/admin/settings': 'Settings',
}

export function AdminLayout() {
  const location = useLocation()

  return (
    <DashboardShell
      links={LINKS}
      title={TITLES[location.pathname] ?? 'Admin dashboard'}
      headerExtra={<AdminNotificationBell />}
    >
      <AnimatedOutlet />
    </DashboardShell>
  )
}
