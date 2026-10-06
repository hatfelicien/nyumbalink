import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { breakpoints, useMediaQuery } from '../../hooks/useMediaQuery'
import { chatService } from '../../services/chatService'
import { cn } from '../../utils/cn'
import { ErrorState } from '../ui/ErrorState'
import { Skeleton } from '../ui/Skeleton'
import { ChatThreadList } from './ChatThreadList'
import { ChatWindow } from './ChatWindow'

/**
 * Inbox shared by tenants and landlords. Side by side on desktop; on smaller screens it
 * behaves like a phone messenger — the list first, then the open conversation full width
 * with a back button.
 */
export function ConversationsView({ heightClass }: { heightClass: string }) {
  const { user } = useAuth()
  const { data: threads, loading, error, reload } = useAsync(() => chatService.listThreadsForUser(user!.id), [user?.id])
  const [searchParams, setSearchParams] = useSearchParams()
  const isDesktop = useMediaQuery(breakpoints.lg)
  const selectedId = searchParams.get('thread')

  const selectThread = useCallback((threadId: string) => setSearchParams({ thread: threadId }), [setSearchParams])
  const closeThread = useCallback(() => setSearchParams({}), [setSearchParams])

  // Desktop always shows a conversation; phones only once one has been picked.
  const selected = threads?.find((t) => t.thread.id === selectedId) ?? (isDesktop ? threads?.[0] : undefined)

  if (error) return <ErrorState onRetry={reload} />
  // Only block on the skeleton before the first successful load — ChatWindow reloads this
  // list after marking a thread read, and unmounting it mid-conversation on every reload
  // would re-fire its mount effect (mark read -> reload) forever.
  if (loading && !threads) return <Skeleton className={cn('w-full', heightClass)} />

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]', heightClass)}>
      <ChatThreadList
        threads={threads ?? []}
        selectedId={selected?.thread.id ?? null}
        onSelect={selectThread}
        className={cn('h-full overflow-y-auto', selected && 'hidden lg:block')}
      />
      {selected ? (
        <div className="flex min-h-0 flex-col gap-3">
          <button
            type="button"
            onClick={closeThread}
            className="flex items-center gap-1.5 self-start text-sm font-medium text-slate-500 hover:text-navy-900 dark:hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All conversations
          </button>
          <ChatWindow thread={selected} currentUserId={user!.id} onMessageSent={reload} className="min-h-0 flex-1" />
        </div>
      ) : (
        <div className="hidden flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700/20 text-slate-500 dark:border-navy-700 lg:flex">
          <MessageCircle className="h-10 w-10" aria-hidden="true" />
          <p className="mt-2 text-sm">Select a conversation to start chatting.</p>
        </div>
      )}
    </div>
  )
}
