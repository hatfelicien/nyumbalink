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
}

export function Drawer({ open, onClose, title, children, side = 'right' }: DrawerProps) {
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
            className={`relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white shadow-soft dark:bg-navy-900 ${
              side === 'right' ? 'ml-auto' : ''
            }`}
          >
            <div className="flex items-center justify-between border-b border-navy-700/10 px-5 py-4 dark:border-navy-700">
              {title && (
                <h2 id="drawer-title" className="text-lg font-semibold text-navy-900 dark:text-white">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="ml-auto rounded-full p-1.5 text-slate-500 transition-colors hover:bg-navy-900/5 hover:text-navy-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
