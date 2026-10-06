import { notifications as seedNotifications } from '../data/notifications'
import type { AppNotification, NotificationChannel, User } from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'

let store: AppNotification[] = [...seedNotifications]

export const ADMIN_AUDIENCE = 'role:admin'

export interface NotifyInput {
  title: string
  body: string
  href?: string
  /** Defaults to in-app plus SMS, the channel that reaches feature phones. */
  channels?: NotificationChannel[]
}

function isFor(notification: AppNotification, user: Pick<User, 'id' | 'role'>) {
  return notification.userId === user.id || notification.userId === `role:${user.role}`
}

/**
 * Records a notification for a user. There is no SMS gateway or push service behind
 * this yet: `channels` captures which ones a real backend should fan out to, and the
 * in-app inbox is the only one actually delivered.
 */
export function notify(userId: string, input: NotifyInput) {
  const created: AppNotification = {
    id: generateId('notification'),
    userId,
    title: input.title,
    body: input.body,
    href: input.href,
    channels: input.channels ?? ['in_app', 'sms'],
    read: false,
    createdAt: new Date().toISOString(),
  }
  store = [created, ...store]
  return created
}

export const notificationsService = {
  listForUser(user: Pick<User, 'id' | 'role'>): Promise<AppNotification[]> {
    return withDelay(() =>
      store
        .filter((n) => isFor(n, user))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    )
  },

  markAllRead(user: Pick<User, 'id' | 'role'>): Promise<void> {
    store = store.map((n) => (isFor(n, user) ? { ...n, read: true } : n))
    return withDelay(() => undefined, 100, 200)
  },
}
