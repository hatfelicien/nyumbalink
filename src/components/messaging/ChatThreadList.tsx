import { useState } from 'react'
import { MessageCircle, Search } from 'lucide-react'
import type { ThreadSummary } from '../../services/chatService'
import { formatRelativeTime } from '../../utils/format'
import { sizedImage } from '../../utils/image'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'

export interface ChatThreadListProps {
  threads: ThreadSummary[]
  selectedId: string | null
  onSelect: (threadId: string) => void
  currentUserId: string
  className?: string
}

export function ChatThreadList({ threads, selectedId, onSelect, currentUserId, className }: ChatThreadListProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? threads.filter(
        (t) =>
          t.otherUser?.name.toLowerCase().includes(needle) ||
          t.property?.title.toLowerCase().includes(needle) ||
          t.lastMessage?.text.toLowerCase().includes(needle),
      )
    : threads
  const unreadTotal = threads.reduce((sum, t) => sum + t.unreadCount, 0)

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-2xl border border-navy-700/10 bg-white dark:border-navy-700 dark:bg-navy-800',
        className,
      )}
    >
      <div className="shrink-0 space-y-3 border-b border-navy-700/10 p-3 dark:border-navy-700">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-navy-900 dark:text-white">Conversations</p>
          {unreadTotal > 0 && (
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {unreadTotal} unread
            </span>
          )}
        </div>
        {threads.length > 0 && (
          <label className="relative block">
            <span className="sr-only">Search conversations</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or listing"
              className="h-10 w-full rounded-full border border-transparent bg-navy-900/5 pl-9 pr-3 text-base text-navy-900 placeholder:text-slate-500/80 focus-visible:border-blue-400 focus-visible:bg-white dark:bg-white/10 dark:text-white sm:text-sm"
            />
          </label>
        )}
      </div>

      {threads.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/5 dark:bg-white/10">
            <MessageCircle className="h-6 w-6 text-slate-500" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-navy-900 dark:text-white">No conversations yet</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">Open a listing and tap “Chat with owner” to start one.</p>
        </div>
      ) : visible.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-500">No conversations match “{query}”.</p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-navy-700/10 overflow-y-auto overscroll-contain dark:divide-navy-700">
          {visible.map((summary) => {
            const unread = summary.unreadCount > 0
            const fromMe = summary.lastMessage?.senderId === currentUserId
            return (
              <li key={summary.thread.id}>
                <button
                  type="button"
                  onClick={() => onSelect(summary.thread.id)}
                  aria-current={selectedId === summary.thread.id ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-navy-900/[0.03] active:bg-navy-900/5 dark:hover:bg-white/5 sm:px-4',
                    selectedId === summary.thread.id && 'bg-blue-500/[0.07] hover:bg-blue-500/10 dark:bg-blue-400/10',
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar name={summary.otherUser?.name ?? '?'} src={summary.otherUser?.avatar} className="h-12 w-12" />
                    {summary.property && (
                      <img
                        src={sizedImage(summary.property.images[0], 96)}
                        alt=""
                        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-md border-2 border-white object-cover dark:border-navy-800"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn('truncate text-sm text-navy-900 dark:text-white', unread ? 'font-bold' : 'font-medium')}>
                        {summary.otherUser?.name ?? 'Unknown user'}
                      </p>
                      {summary.lastMessage && (
                        <span className={cn('shrink-0 text-xs', unread ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-500')}>
                          {formatRelativeTime(summary.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {summary.property && <p className="truncate text-xs text-slate-500">{summary.property.title}</p>}
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className={cn('min-w-0 flex-1 truncate text-sm', unread ? 'font-medium text-navy-900 dark:text-white' : 'text-slate-500')}>
                        {summary.lastMessage ? `${fromMe ? 'You: ' : ''}${summary.lastMessage.text}` : 'No messages yet'}
                      </p>
                      {unread && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-semibold text-white">
                          {summary.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
