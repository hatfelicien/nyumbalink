import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700/15 px-6 py-16 text-center dark:border-navy-700">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900/5 dark:bg-white/10">
        <Icon className="h-6 w-6 text-slate-500" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-navy-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
