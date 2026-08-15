import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
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
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, description, children, size = 'md', footer }: ModalProps) {
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

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={cn(
              'relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-soft dark:bg-navy-800',
              sizeClasses[size],
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-navy-900/5 hover:text-navy-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {title && (
              <h2 id="modal-title" className="pr-8 text-xl font-semibold text-navy-900 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
            <div className={cn(title || description ? 'mt-5' : undefined)}>{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
