import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { cn } from '../../utils/cn'

export interface NotificationItem {
  id: string
  title: string
  subtitle: string
  time: string
}

export interface NotificationBellProps {
  items: NotificationItem[]
  viewAllHref: string
  emptyLabel: string
}

export function NotificationBell({ items, viewAllHref, emptyLabel }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useFocusTrap<HTMLDivElement>(open)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {items.length > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close notifications"
              tabIndex={-1}
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={containerRef}
              role="dialog"
              aria-label="Notifications"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-navy-700/10 bg-white shadow-soft dark:border-navy-700 dark:bg-navy-800"
            >
              <div className="border-b border-navy-700/10 px-4 py-3 dark:border-navy-700">
                <p className="text-sm font-semibold text-navy-900 dark:text-white">Notifications</p>
              </div>
              <div className={cn('max-h-80 overflow-y-auto', items.length === 0 && 'p-6 text-center')}>
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">{emptyLabel}</p>
                ) : (
                  <ul className="divide-y divide-navy-700/10 dark:divide-navy-700">
                    {items.map((item) => (
                      <li key={item.id} className="px-4 py-3">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">{item.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{item.subtitle}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.time}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Link
                to={viewAllHref}
                onClick={() => setOpen(false)}
                className="block border-t border-navy-700/10 px-4 py-3 text-center text-sm font-medium text-blue-500 hover:text-blue-400 dark:border-navy-700"
              >
                View all
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
