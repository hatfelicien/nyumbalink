import { NotificationBell } from './NotificationBell'
import { useAsync } from '../../hooks/useAsync'
import { useNotificationItems } from '../../hooks/useNotificationItems'
import { applicationsService } from '../../services/applicationsService'
import { formatRelativeTime } from '../../utils/format'

export function AdminNotificationBell() {
  const { data } = useAsync(() => applicationsService.list(), [])
  const { items: notifications, markAllRead } = useNotificationItems({ unreadOnly: true })

  const applications = (data ?? [])
    .filter((application) => application.status === 'pending')
    .map((application) => ({
      id: application.id,
      title: `${application.name} applied to become an owner`,
      subtitle: application.message,
      time: formatRelativeTime(application.createdAt),
      href: '/admin/applications',
    }))

  return (
    <NotificationBell
      items={[...notifications, ...applications]}
      viewAllHref="/admin/applications"
      emptyLabel="Nothing needs your attention."
      onOpen={markAllRead}
    />
  )
}
