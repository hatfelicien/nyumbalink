import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { ChatThreadList } from '../../components/messaging/ChatThreadList'
import { ChatWindow } from '../../components/messaging/ChatWindow'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { chatService } from '../../services/chatService'

export function MessagesPage() {
  const { user } = useAuth()
  const { data: threads, loading, error, reload } = useAsync(() => chatService.listThreadsForUser(user!.id), [user?.id])
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('thread')

  const selectThread = useCallback(
    (threadId: string) => {
      setSearchParams({ thread: threadId }, { replace: true })
    },
    [setSearchParams],
  )

  const selected = threads?.find((t) => t.thread.id === selectedId) ?? threads?.[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-navy-900 dark:text-white">Messages</h1>
      <p className="mt-1 text-sm text-slate-500">Chat directly with owners about the listings you're interested in.</p>

      <div className="mt-6">
        {error ? (
          <ErrorState onRetry={reload} />
        ) : loading && !threads ? (
          // Only block on the skeleton before the first successful load — ChatWindow reloads
          // this list after marking a thread read, and unmounting it mid-conversation on every
          // reload would re-fire its mount effect (mark read -> reload) forever.
          <Skeleton className="h-[32rem] w-full" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <ChatThreadList threads={threads ?? []} selectedId={selected?.thread.id ?? null} onSelect={selectThread} />
            {selected ? (
              <ChatWindow thread={selected} currentUserId={user!.id} onMessageSent={reload} className="h-[32rem]" />
            ) : (
              <div className="hidden h-[32rem] flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700/20 text-slate-500 dark:border-navy-700 lg:flex">
                <MessageCircle className="h-10 w-10" aria-hidden="true" />
                <p className="mt-2 text-sm">Select a conversation to start chatting.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
