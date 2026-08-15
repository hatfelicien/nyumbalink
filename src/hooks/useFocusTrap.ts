import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Traps focus inside the returned ref while `active`, and restores it to the trigger on close. */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    triggerRef.current = document.activeElement as HTMLElement | null
    const container = containerRef.current
    const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    focusable?.[0]?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !container) return
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
  }, [active])

  return containerRef
}
