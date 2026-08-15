import type { ChatMessage, ChatThread } from '../types'

export const chatThreads: ChatThread[] = [
  {
    id: 'thread-1',
    propertyId: 'property-1',
    guestId: 'guest-1',
    ownerId: 'owner-1',
    createdAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'thread-2',
    propertyId: 'property-14',
    guestId: 'guest-1',
    ownerId: 'owner-1',
    createdAt: '2026-08-12T08:30:00.000Z',
  },
]

export const chatMessages: ChatMessage[] = [
  {
    id: 'message-1',
    threadId: 'thread-1',
    senderId: 'guest-1',
    text: 'Hi! Is this apartment still available for viewing this weekend?',
    read: true,
    createdAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'message-2',
    threadId: 'thread-1',
    senderId: 'owner-1',
    text: 'Hello Grace, yes it is. I can show you around on Saturday morning, does 10am work?',
    read: true,
    createdAt: '2026-08-10T10:22:00.000Z',
  },
  {
    id: 'message-3',
    threadId: 'thread-1',
    senderId: 'guest-1',
    text: 'Saturday 10am works well. Is the caution money negotiable at all?',
    read: false,
    createdAt: '2026-08-10T10:25:00.000Z',
  },
  {
    id: 'message-4',
    threadId: 'thread-2',
    senderId: 'guest-1',
    text: 'Good afternoon, I saw the Compact Studio in Kacyiru — is parking included?',
    read: true,
    createdAt: '2026-08-12T08:30:00.000Z',
  },
  {
    id: 'message-5',
    threadId: 'thread-2',
    senderId: 'owner-1',
    text: 'There is street parking right outside the compound, secured by the night guard.',
    read: false,
    createdAt: '2026-08-12T09:05:00.000Z',
  },
]
