import { useEffect, useState } from 'react'

/** Whether the element with this id is currently on screen. Re-checks when `deps` change (e.g. after it renders). */
export function useInView(elementId: string, deps: unknown[] = []) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = document.getElementById(elementId)
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(element)
    return () => observer.disconnect()
    // deps is caller-controlled, like useEffect's own dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId, ...deps])

  return inView
}
