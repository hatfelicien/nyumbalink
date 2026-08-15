import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { chatService } from '../../services/chatService'
import type { ChatMessage } from '../../types'
import { formatRelativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'
import { Skeleton } from '../ui/Skeleton'
import type { ThreadSummary } from '../../services/chatService'

export interface ChatWindowProps {
  thread: ThreadSummary
  currentUserId: string
  onMessageSent?: () => void
  className?: string
}

/** Merges by id so a message can never appear twice, regardless of fetch/optimistic-append races. */
function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(existing.map((m) => [m.id, m]))
  for (const message of incoming) byId.set(message.id, message)
  return Array.from(byId.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function ChatWindow({ thread, currentUserId, onMessageSent, className }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setMessages(null)
    chatService.getMessages(thread.thread.id).then((data) => {
      if (!cancelled) setMessages(data)
    })
    chatService.markThreadRead(thread.thread.id, currentUserId).then(() => {
      if (!cancelled) onMessageSent?.()
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.thread.id, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setSending(true)
    setText('')
    const message = await chatService.sendMessage(thread.thread.id, currentUserId, trimmed)
    setMessages((prev) => mergeMessages(prev ?? [], [message]))
    setSending(false)
    onMessageSent?.()
  }

  return (
    <div className={cn('flex h-full flex-col overflow-hidden rounded-2xl border border-navy-700/10 bg-white dark:border-navy-700 dark:bg-navy-800', className)}>
      <div className="flex items-center gap-3 border-b border-navy-700/10 px-4 py-3 dark:border-navy-700">
        <Avatar name={thread.otherUser?.name ?? '?'} src={thread.otherUser?.avatar} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">{thread.otherUser?.name ?? 'Unknown user'}</p>
          {thread.property && (
            <Link to={`/listings/${thread.property.id}`} className="truncate text-xs text-blue-500 hover:text-blue-400">
              {thread.property.title}
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages === null ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="ml-auto h-10 w-1/2" />
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === currentUserId
            return (
              <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                    mine
                      ? 'rounded-br-sm bg-blue-500 text-white'
                      : 'rounded-bl-sm bg-navy-900/5 text-navy-900 dark:bg-white/10 dark:text-white',
                  )}
                >
                  <p className="leading-relaxed">{message.text}</p>
                  <p className={cn('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-slate-500')}>
                    {formatRelativeTime(message.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-navy-700/10 p-3 dark:border-navy-700">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          aria-label="Message"
          className="h-11 flex-1 rounded-xl border border-navy-700/15 bg-white px-4 text-sm text-navy-900 placeholder:text-slate-500/70 transition-colors focus-visible:border-blue-400 dark:border-navy-700 dark:bg-navy-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white transition-colors hover:bg-blue-400 disabled:pointer-events-none disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
