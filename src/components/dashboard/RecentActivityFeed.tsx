import { Building2, ClipboardList } from 'lucide-react'
import type { OwnerApplication, Property } from '../../types'
import { EmptyState } from '../ui/EmptyState'
import { formatRelativeTime } from '../../utils/format'

interface ActivityItem {
  id: string
  icon: typeof Building2
  text: string
  createdAt: string
}

export function RecentActivityFeed({ properties, applications }: { properties: Property[]; applications: OwnerApplication[] }) {
  const items: ActivityItem[] = [
    ...properties.map((p) => ({
      id: `property-${p.id}`,
      icon: Building2,
      text: `New listing: "${p.title}"`,
      createdAt: p.createdAt,
    })),
    ...applications.map((a) => ({
      id: `application-${a.id}`,
      icon: ClipboardList,
      text: `${a.name} applied to become an owner`,
      createdAt: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  if (items.length === 0) return <EmptyState title="No recent activity" />

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <item.icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-navy-900 dark:text-white">{item.text}</p>
            <p className="text-xs text-slate-500">{formatRelativeTime(item.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
