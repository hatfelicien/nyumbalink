import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

const variantConfig: Record<ToastVariant, { icon: typeof Info; classes: string }> = {
  success: { icon: CheckCircle2, classes: 'text-emerald-500' },
  error: { icon: XCircle, classes: 'text-rose-500' },
  warning: { icon: TriangleAlert, classes: 'text-amber-500' },
  info: { icon: Info, classes: 'text-blue-500' },
}

export interface ToastViewportProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, classes } = variantConfig[toast.variant]
          return (
            <motion.div
              key={toast.id}
              role="status"
              layout
              initial={{ opacity: 0, y: 40, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-navy-700/10 bg-white p-4 shadow-soft dark:border-navy-700 dark:bg-navy-800"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', classes)} aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-navy-900 dark:text-white">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-sm text-slate-500">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-slate-500 hover:text-navy-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
