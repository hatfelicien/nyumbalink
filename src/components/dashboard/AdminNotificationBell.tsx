import { NotificationBell } from './NotificationBell'
import { useAsync } from '../../hooks/useAsync'
import { applicationsService } from '../../services/applicationsService'
import { formatRelativeTime } from '../../utils/format'

export function AdminNotificationBell() {
  const { data } = useAsync(() => applicationsService.list(), [])

  const items = (data ?? [])
    .filter((application) => application.status === 'pending')
    .map((application) => ({
      id: application.id,
      title: `${application.name} applied to become an owner`,
      subtitle: application.message,
      time: formatRelativeTime(application.createdAt),
    }))

  return <NotificationBell items={items} viewAllHref="/admin/applications" emptyLabel="No pending applications." />
}
