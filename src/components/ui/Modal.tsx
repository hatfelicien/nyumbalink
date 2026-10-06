import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { breakpoints, useMediaQuery } from '../../hooks/useMediaQuery'
import { cn } from '../../utils/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

/**
 * A centred dialog from tablet width up; on phones it becomes a bottom sheet so the
 * actions sit within thumb reach. The footer stays pinned while long content scrolls.
 */
export function Modal({ open, onClose, title, description, children, size = 'md', footer }: ModalProps) {
  const containerRef = useFocusTrap<HTMLDivElement>(open)
  const isSheet = !useMediaQuery(breakpoints.sm)
  const titleId = useId()
  const descriptionId = useId()

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

  const hidden = isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 8 }
  const shown = isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
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
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className={cn(
              'relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-soft dark:bg-navy-800 sm:max-h-[90vh] sm:rounded-2xl',
              sizeClasses[size],
            )}
          >
            <span className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-navy-900/15 dark:bg-white/20 sm:hidden" aria-hidden="true" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-3 top-3 z-10 rounded-full p-2 text-slate-500 transition-colors hover:bg-navy-900/5 hover:text-navy-900 dark:hover:bg-white/10 dark:hover:text-white sm:right-4 sm:top-4"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="overflow-y-auto overscroll-contain px-5 pb-6 pt-4 sm:p-6">
              {title && (
                <h2 id={titleId} className="pr-10 text-lg font-semibold text-navy-900 dark:text-white sm:text-xl">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 pr-6 text-sm text-slate-500">
                  {description}
                </p>
              )}
              <div className={cn(title || description ? 'mt-5' : undefined)}>{children}</div>
            </div>

            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-navy-700/10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 dark:border-navy-700 sm:flex-row sm:pb-4 sm:justify-end sm:gap-3 sm:px-6 [&>*]:w-full sm:[&>*]:w-auto">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
