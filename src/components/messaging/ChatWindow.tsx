import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, CheckCheck, Clock, Send } from 'lucide-react'
import { chatService } from '../../services/chatService'
import type { ThreadSummary } from '../../services/chatService'
import type { ChatMessage } from '../../types'
import { cn } from '../../utils/cn'
import { formatRwf } from '../../utils/format'
import { sizedImage } from '../../utils/image'
import { Avatar } from '../ui/Avatar'
import { Skeleton } from '../ui/Skeleton'

export interface ChatWindowProps {
  thread: ThreadSummary
  currentUserId: string
  onMessageSent?: () => void
  /** Shown as a back arrow in the header — the phone layout uses it to return to the list. */
  onBack?: () => void
  className?: string
}

/** A message on screen; `pending` ones were sent from this device and are still on their way. */
type DisplayMessage = ChatMessage & { pending?: boolean }

const QUICK_REPLIES = ['Is it still available?', 'Can I schedule a viewing?', 'Is the price negotiable?']

/** Merges by id so a message can never appear twice, regardless of fetch/optimistic-append races. */
function mergeMessages(existing: DisplayMessage[], incoming: DisplayMessage[]): DisplayMessage[] {
  const byId = new Map(existing.map((m) => [m.id, m]))
  for (const message of incoming) byId.set(message.id, message)
  return Array.from(byId.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

function dayKey(iso: string) {
  return new Date(iso).toDateString()
}

function dayLabel(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** Messages from the same person within five minutes read as one block. */
function continuesGroup(previous: DisplayMessage | undefined, message: DisplayMessage | undefined) {
  if (!previous || !message || previous.senderId !== message.senderId) return false
  if (dayKey(previous.createdAt) !== dayKey(message.createdAt)) return false
  return new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() < 5 * 60 * 1000
}

export function ChatWindow({ thread, currentUserId, onMessageSent, onBack, className }: ChatWindowProps) {
  const [messages, setMessages] = useState<DisplayMessage[] | null>(null)
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { property, otherUser } = thread
  const otherRole = thread.thread.ownerId === currentUserId ? 'Tenant' : 'Landlord'

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

  // Keep the newest message in view. Scroll the list itself — scrollIntoView would also scroll the page.
  useLayoutEffect(() => {
    const list = scrollRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: messages && messages.length > 1 ? 'smooth' : 'auto' })
  }, [messages?.length])

  // The composer grows with its content, up to about five lines.
  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`
  }, [text])

  async function send(body: string) {
    const trimmed = body.trim()
    if (!trimmed) return
    setText('')
    // Show the message straight away; the service confirms it a moment later.
    const tempId = `pending-${Date.now()}`
    const optimistic: DisplayMessage = {
      id: tempId,
      threadId: thread.thread.id,
      senderId: currentUserId,
      text: trimmed,
      read: false,
      createdAt: new Date().toISOString(),
      pending: true,
    }
    setMessages((prev) => mergeMessages(prev ?? [], [optimistic]))
    const saved = await chatService.sendMessage(thread.thread.id, currentUserId, trimmed)
    setMessages((prev) => mergeMessages((prev ?? []).filter((m) => m.id !== tempId), [saved]))
    onMessageSent?.()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void send(text)
    inputRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // On a physical keyboard Enter sends and Shift+Enter adds a line; on touch keyboards Enter adds a line.
    const touch = window.matchMedia('(pointer: coarse)').matches
    if (event.key === 'Enter' && !event.shiftKey && !touch && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void send(text)
    }
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-navy-800',
        'lg:rounded-2xl lg:border lg:border-navy-700/10 lg:dark:border-navy-700',
        className,
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-navy-700/10 px-2 py-2 dark:border-navy-700 sm:px-4 sm:py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <Avatar name={otherUser?.name ?? '?'} src={otherUser?.avatar} size="sm" className={cn('h-10 w-10 shrink-0', !onBack && 'ml-2 sm:ml-0')} />
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-sm font-semibold text-navy-900 dark:text-white sm:text-base">{otherUser?.name ?? 'Unknown user'}</p>
          <p className="truncate text-xs text-slate-500">{otherRole}</p>
        </div>
      </header>

      {property && (
        <Link
          to={`/listings/${property.id}`}
          className="flex shrink-0 items-center gap-3 border-b border-navy-700/10 bg-navy-900/[0.02] px-3 py-2 transition-colors hover:bg-navy-900/[0.05] dark:border-navy-700 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] sm:px-4"
        >
          <img src={sizedImage(property.images[0], 160)} alt="" className="h-10 w-12 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-900 dark:text-white">{property.title}</p>
            <p className="truncate text-xs text-slate-500">
              {formatRwf(property.price)}
              {property.purpose === 'rent' && '/mo'} · {property.district}
            </p>
          </div>
          <span className="hidden shrink-0 text-xs font-medium text-blue-500 sm:block">View listing</span>
        </Link>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/60 px-3 py-4 dark:bg-navy-900/40 sm:px-5"
        aria-live="polite"
        aria-label="Messages"
      >
        {messages === null ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="ml-auto h-12 w-1/2" />
            <Skeleton className="h-12 w-3/5" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-medium text-navy-900 dark:text-white">Start the conversation</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">Ask about availability, viewing times or the caution money.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1]
            const next = messages[index + 1]
            const mine = message.senderId === currentUserId
            const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt)
            const grouped = continuesGroup(previous, message)
            const endsGroup = !continuesGroup(message, next)

            return (
              <Fragment key={message.id}>
                {newDay && (
                  <div className="my-4 flex justify-center first:mt-0">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm dark:bg-navy-800">
                      {dayLabel(message.createdAt)}
                    </span>
                  </div>
                )}
                <div className={cn('flex', mine ? 'justify-end' : 'justify-start', grouped ? 'mt-0.5' : 'mt-3')}>
                  <div
                    className={cn(
                      'max-w-[82%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug sm:max-w-[70%] sm:text-sm',
                      mine ? 'bg-blue-500 text-white' : 'bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white',
                      mine && endsGroup && 'rounded-br-md',
                      !mine && endsGroup && 'rounded-bl-md',
                      message.pending && 'opacity-70',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.text}</p>
                    {endsGroup && (
                      <p className={cn('mt-1 flex items-center justify-end gap-1 text-[10px]', mine ? 'text-white/75' : 'text-slate-500')}>
                        {timeLabel(message.createdAt)}
                        {mine &&
                          (message.pending ? (
                            <Clock className="h-3 w-3" aria-label="Sending" />
                          ) : message.read ? (
                            <CheckCheck className="h-3.5 w-3.5" aria-label="Seen" />
                          ) : (
                            <Check className="h-3.5 w-3.5" aria-label="Sent" />
                          ))}
                      </p>
                    )}
                  </div>
                </div>
              </Fragment>
            )
          })
        )}
      </div>

      <div className="shrink-0 border-t border-navy-700/10 bg-white dark:border-navy-700 dark:bg-navy-800">
        {messages !== null && messages.length === 0 && (
          <div className="flex gap-2 overflow-x-auto px-3 pt-3 scrollbar-none sm:px-4">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => void send(reply)}
                className="shrink-0 rounded-full border border-blue-500/30 bg-blue-500/5 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-500/10 dark:text-blue-400"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 lg:pb-3"
        >
          <label htmlFor={`composer-${thread.thread.id}`} className="sr-only">
            Message {otherUser?.name ?? ''}
          </label>
          <textarea
            id={`composer-${thread.thread.id}`}
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            enterKeyHint="send"
            className="max-h-[140px] min-h-[44px] flex-1 resize-none rounded-3xl border border-navy-700/15 bg-slate-50 px-4 py-2.5 text-base leading-snug text-navy-900 placeholder:text-slate-500/70 transition-colors focus-visible:border-blue-400 focus-visible:bg-white dark:border-navy-700 dark:bg-navy-900 dark:text-white sm:text-sm"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-glow transition-all hover:bg-blue-400 active:scale-90 disabled:bg-navy-900/10 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-white/10"
          >
            <Send className="h-[18px] w-[18px] -translate-x-px translate-y-px" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  )
}
