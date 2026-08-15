import { NotificationBell } from './NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { enquiriesService } from '../../services/enquiriesService'
import { formatRelativeTime } from '../../utils/format'

export function OwnerNotificationBell() {
  const { user } = useAuth()
  const { data } = useAsync(() => enquiriesService.getByOwner(user!.id), [user?.id])

  const items = (data ?? [])
    .filter((enquiry) => !enquiry.read)
    .map((enquiry) => ({
      id: enquiry.id,
      title: `New enquiry from ${enquiry.name}`,
      subtitle: enquiry.message,
      time: formatRelativeTime(enquiry.createdAt),
    }))

  return <NotificationBell items={items} viewAllHref="/owner/enquiries" emptyLabel="You're all caught up." />
}
