import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { breakpoints, useMediaQuery } from '../../hooks/useMediaQuery'
import { chatService } from '../../services/chatService'
import { cn } from '../../utils/cn'
import { ErrorState } from '../ui/ErrorState'
import { Skeleton } from '../ui/Skeleton'
import { ChatThreadList } from './ChatThreadList'
import { ChatWindow } from './ChatWindow'

export interface ConversationsViewProps {
  /** Height of the two-pane layout on desktop. Below that the list flows with the page. */
  desktopHeightClass: string
}

/**
 * Inbox shared by tenants and landlords. On desktop it is two panes side by side. On
 * phones and tablets it works like a phone messenger: the list first, and an open
 * conversation fills the whole screen (covering the tab bar) with a back arrow.
 */
export function ConversationsView({ desktopHeightClass }: ConversationsViewProps) {
  const { user } = useAuth()
  const { data: threads, loading, error, reload } = useAsync(() => chatService.listThreadsForUser(user!.id), [user?.id])
  const [searchParams, setSearchParams] = useSearchParams()
  const isDesktop = useMediaQuery(breakpoints.lg)
  const selectedId = searchParams.get('thread')

  const selectThread = useCallback((threadId: string) => setSearchParams({ thread: threadId }), [setSearchParams])
  const closeThread = useCallback(() => setSearchParams({}), [setSearchParams])

  // Desktop always shows a conversation; phones only once one has been picked.
  const selected = threads?.find((t) => t.thread.id === selectedId) ?? (isDesktop ? threads?.[0] : undefined)
  const fullScreen = !isDesktop && Boolean(selected)

  // The full-screen conversation owns scrolling while it is open.
  useEffect(() => {
    if (!fullScreen) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && closeThread()
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [fullScreen, closeThread])

  if (error) return <ErrorState onRetry={reload} />
  // Only block on the skeleton before the first successful load — ChatWindow reloads this
  // list after marking a thread read, and unmounting it mid-conversation on every reload
  // would re-fire its mount effect (mark read -> reload) forever.
  if (loading && !threads) return <Skeleton className={cn('h-96 w-full', desktopHeightClass)} />

  const list = (
    <ChatThreadList
      threads={threads ?? []}
      selectedId={selected?.thread.id ?? null}
      onSelect={selectThread}
      currentUserId={user!.id}
      className={isDesktop ? 'h-full' : undefined}
    />
  )

  if (!isDesktop) {
    return (
      <>
        {list}
        {fullScreen &&
          selected &&
          createPortal(
            <motion.div
              key={selected.thread.id}
              role="dialog"
              aria-modal="true"
              aria-label={`Conversation with ${selected.otherUser?.name ?? 'user'}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 40 }}
              className="fixed inset-0 z-[55] flex h-dvh flex-col bg-white pt-[env(safe-area-inset-top)] dark:bg-navy-800"
            >
              <ChatWindow thread={selected} currentUserId={user!.id} onMessageSent={reload} onBack={closeThread} className="flex-1" />
            </motion.div>,
            document.body,
          )}
      </>
    )
  }

  return (
    <div className={cn('grid grid-cols-[20rem_minmax(0,1fr)] gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]', desktopHeightClass)}>
      {list}
      {selected ? (
        <ChatWindow thread={selected} currentUserId={user!.id} onMessageSent={reload} className="h-full" />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700/20 text-slate-500 dark:border-navy-700">
          <MessageCircle className="h-10 w-10" aria-hidden="true" />
          <p className="mt-2 text-sm">Select a conversation to start chatting.</p>
        </div>
      )}
    </div>
  )
}
