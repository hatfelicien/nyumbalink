import type { ThreadSummary } from '../../services/chatService'
import { formatRelativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../ui/EmptyState'

export interface ChatThreadListProps {
  threads: ThreadSummary[]
  selectedId: string | null
  onSelect: (threadId: string) => void
  className?: string
}

export function ChatThreadList({ threads, selectedId, onSelect, className }: ChatThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-navy-700/10 bg-white p-6 dark:border-navy-700 dark:bg-navy-800', className)}>
        <EmptyState title="No conversations yet" description="Messages with owners and guests will show up here." />
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-navy-700/10 bg-white dark:border-navy-700 dark:bg-navy-800', className)}>
      <ul className="divide-y divide-navy-700/10 dark:divide-navy-700">
        {threads.map((summary) => (
          <li key={summary.thread.id}>
            <button
              type="button"
              onClick={() => onSelect(summary.thread.id)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-navy-900/5 dark:hover:bg-white/5',
                selectedId === summary.thread.id && 'bg-blue-500/10 hover:bg-blue-500/10',
              )}
            >
              <Avatar name={summary.otherUser?.name ?? '?'} src={summary.otherUser?.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-navy-900 dark:text-white">
                    {summary.otherUser?.name ?? 'Unknown user'}
                  </p>
                  {summary.lastMessage && (
                    <span className="shrink-0 text-xs text-slate-500">{formatRelativeTime(summary.lastMessage.createdAt)}</span>
                  )}
                </div>
                {summary.property && <p className="truncate text-xs text-slate-500">{summary.property.title}</p>}
                {summary.lastMessage && (
                  <p className="mt-0.5 truncate text-sm text-slate-500">{summary.lastMessage.text}</p>
                )}
              </div>
              {summary.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-semibold text-white">
                  {summary.unreadCount}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
