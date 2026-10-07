import { ConversationsView } from '../../components/messaging/ConversationsView'

export function MessagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">Messages</h1>
      <p className="mt-1 text-sm text-slate-500">Chat directly with owners about the listings you're interested in.</p>

      <div className="mt-5 sm:mt-6">
        <ConversationsView desktopHeightClass="h-[calc(100dvh-14rem)] min-h-[30rem] max-h-[52rem]" />
      </div>
    </div>
  )
}
