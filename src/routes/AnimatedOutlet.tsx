import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export function AnimatedOutlet() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Deliberately no AnimatePresence/exit here. The old page unmounts immediately
  // (no exit transition) and only the new one fades/slides in on `initial` -> `animate`.
  // An exit-tracking AnimatePresence around route content proved fragile in practice —
  // it depends on precise unmount timing, and any route whose subtree owns its own
  // nested AnimatePresence (modals, galleries) or that navigates via `navigate()` from
  // outside a synchronous click handler (e.g. after an `await`) could leave the incoming
  // page stuck rendering its `exit` state (opacity 0) instead of transitioning in.
  return (
    <motion.div
      key={location.key}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Outlet />
    </motion.div>
  )
}
