import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastViewport } from '../components/ui/Toast'
import type { ToastItem, ToastVariant } from '../components/ui/Toast'
import { generateId } from '../utils/id'

interface ToastContextValue {
  showToast: (title: string, options?: { description?: string; variant?: ToastVariant }) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const AUTO_DISMISS_MS = 4500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (title: string, options?: { description?: string; variant?: ToastVariant }) => {
      const id = generateId('toast')
      setToasts((current) => [
        ...current,
        { id, title, description: options?.description, variant: options?.variant ?? 'info' },
      ])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
