import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  side?: 'right' | 'left'
  /** Pinned to the bottom of the drawer, e.g. apply/reset actions for a filter panel. */
  footer?: ReactNode
  /** Skip the title bar and float the close button over the content (for panels that bring their own chrome). */
  bare?: boolean
}

export function Drawer({ open, onClose, title, children, side = 'right', footer, bare = false }: DrawerProps) {
  const containerRef = useFocusTrap<HTMLDivElement>(open)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  const from = side === 'right' ? '100%' : '-100%'

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
            initial={{ x: from }}
            animate={{ x: 0 }}
            exit={{ x: from }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`relative z-10 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-soft dark:bg-navy-900 ${
              side === 'right' ? 'ml-auto' : ''
            }`}
          >
            <div
              className={
                bare
                  ? 'absolute right-3 top-3 z-10'
                  : 'flex items-center justify-between border-b border-navy-700/10 px-5 py-4 dark:border-navy-700'
              }
            >
              {title && (
                <h2 id="drawer-title" className="text-lg font-semibold text-navy-900 dark:text-white">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className={
                  bare
                    ? 'rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white'
                    : 'ml-auto rounded-full p-1.5 text-slate-500 transition-colors hover:bg-navy-900/5 hover:text-navy-900 dark:hover:bg-white/10 dark:hover:text-white'
                }
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className={bare ? 'flex-1 overflow-y-auto overscroll-contain' : 'flex-1 overflow-y-auto overscroll-contain p-5'}>{children}</div>
            {footer && (
              <div className="border-t border-navy-700/10 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 dark:border-navy-700 dark:bg-navy-900">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
