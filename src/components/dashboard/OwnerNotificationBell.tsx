import { NotificationBell } from './NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useNotificationItems } from '../../hooks/useNotificationItems'
import { enquiriesService } from '../../services/enquiriesService'
import { formatRelativeTime } from '../../utils/format'

export function OwnerNotificationBell() {
  const { user } = useAuth()
  const { data } = useAsync(() => enquiriesService.getByOwner(user!.id), [user?.id])
  const { items: notifications, markAllRead } = useNotificationItems({ unreadOnly: true })

  const enquiries = (data ?? [])
    .filter((enquiry) => !enquiry.read)
    .map((enquiry) => ({
      id: enquiry.id,
      title: `New enquiry from ${enquiry.name}`,
      subtitle: enquiry.message,
      time: formatRelativeTime(enquiry.createdAt),
      href: '/owner/enquiries',
    }))

  return (
    <NotificationBell
      items={[...notifications, ...enquiries]}
      viewAllHref="/owner/enquiries"
      emptyLabel="You're all caught up."
      onOpen={markAllRead}
    />
  )
}
