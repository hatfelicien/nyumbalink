import { useCallback } from 'react'
import type { NotificationItem } from '../components/dashboard/NotificationBell'
import { useAuth } from '../context/AuthContext'
import { notificationsService } from '../services/notificationsService'
import { formatRelativeTime } from '../utils/format'
import { useAsync } from './useAsync'

/** The signed-in user's notifications, shaped for `NotificationBell`. */
export function useNotificationItems(options: { unreadOnly?: boolean; limit?: number } = {}) {
  const { user } = useAuth()
  const { data } = useAsync(() => (user ? notificationsService.listForUser(user) : Promise.resolve([])), [user?.id])

  const items: NotificationItem[] = (data ?? [])
    .filter((n) => !options.unreadOnly || !n.read)
    .slice(0, options.limit ?? 8)
    .map((n) => ({
      id: n.id,
      title: n.title,
      subtitle: n.body,
      time: formatRelativeTime(n.createdAt),
      href: n.href,
      unread: !n.read,
    }))

  const markAllRead = useCallback(() => {
    if (user) notificationsService.markAllRead(user)
  }, [user])

  return { items, markAllRead }
}
