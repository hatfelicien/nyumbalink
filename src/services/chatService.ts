import { chatMessages as seedMessages, chatThreads as seedThreads } from '../data/chats'
import type { ChatMessage, ChatThread, Property, User } from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'
import { propertiesService } from './propertiesService'
import { usersService } from './usersService'

let threadStore: ChatThread[] = [...seedThreads]
let messageStore: ChatMessage[] = [...seedMessages]

export interface ThreadSummary {
  thread: ChatThread
  property: Property | undefined
  otherUser: User | undefined
  lastMessage: ChatMessage | undefined
  unreadCount: number
}

function threadsForUser(userId: string) {
  return threadStore.filter((t) => t.guestId === userId || t.ownerId === userId)
}

function messagesForThread(threadId: string) {
  return messageStore
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

async function summarize(thread: ChatThread, forUserId: string): Promise<ThreadSummary> {
  const otherId = thread.guestId === forUserId ? thread.ownerId : thread.guestId
  const [property, otherUser] = await Promise.all([
    propertiesService.getById(thread.propertyId),
    usersService.getById(otherId),
  ])
  const messages = messagesForThread(thread.id)
  const lastMessage = messages[messages.length - 1]
  const unreadCount = messages.filter((m) => m.senderId !== forUserId && !m.read).length

  return { thread, property, otherUser, lastMessage, unreadCount }
}

export const chatService = {
  async listThreadsForUser(userId: string): Promise<ThreadSummary[]> {
    const threads = threadsForUser(userId)
    const summaries = await Promise.all(threads.map((t) => summarize(t, userId)))
    return withDelay(() =>
      summaries.sort((a, b) => {
        const aTime = new Date(a.lastMessage?.createdAt ?? a.thread.createdAt).getTime()
        const bTime = new Date(b.lastMessage?.createdAt ?? b.thread.createdAt).getTime()
        return bTime - aTime
      }),
    )
  },

  async getUnreadCountForUser(userId: string): Promise<number> {
    const threads = threadsForUser(userId)
    const count = threads.reduce(
      (total, thread) => total + messagesForThread(thread.id).filter((m) => m.senderId !== userId && !m.read).length,
      0,
    )
    return withDelay(() => count)
  },

  getOrCreateThread(propertyId: string, guestId: string, ownerId: string): Promise<ChatThread> {
    const existing = threadStore.find(
      (t) => t.propertyId === propertyId && t.guestId === guestId && t.ownerId === ownerId,
    )
    if (existing) return withDelay(() => existing)

    const created: ChatThread = {
      id: generateId('thread'),
      propertyId,
      guestId,
      ownerId,
      createdAt: new Date().toISOString(),
    }
    threadStore = [created, ...threadStore]
    return withDelay(() => created)
  },

  getThread(threadId: string): Promise<ChatThread | undefined> {
    return withDelay(() => threadStore.find((t) => t.id === threadId))
  },

  getMessages(threadId: string): Promise<ChatMessage[]> {
    return withDelay(() => messagesForThread(threadId))
  },

  sendMessage(threadId: string, senderId: string, text: string): Promise<ChatMessage> {
    const created: ChatMessage = {
      id: generateId('message'),
      threadId,
      senderId,
      text,
      read: false,
      createdAt: new Date().toISOString(),
    }
    messageStore = [...messageStore, created]
    return withDelay(() => created)
  },

  markThreadRead(threadId: string, readerId: string): Promise<void> {
    messageStore = messageStore.map((m) => (m.threadId === threadId && m.senderId !== readerId ? { ...m, read: true } : m))
    return withDelay(() => undefined)
  },
}
