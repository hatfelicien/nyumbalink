import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Scale, X } from 'lucide-react'
import { useCompare } from '../../context/CompareContext'
import { useLanguage } from '../../context/LanguageContext'
import { cn } from '../../utils/cn'

/** Floating shortcut to the comparison page, shown on public pages once a listing is picked. */
export function CompareBar() {
  const { compareIds, clearCompare } = useCompare()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const visible = compareIds.length > 0 && pathname !== '/compare'
  const onListing = pathname.startsWith('/listings/')

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className={cn(
            'bottom-tabbar pointer-events-none fixed inset-x-0 z-30 flex justify-end px-4 print:hidden md:bottom-6 md:justify-center',
            // Listing pages have their own sticky call-to-action bar below desktop width.
            onListing && 'max-lg:hidden',
          )}
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-navy-900 py-1.5 pl-4 pr-1.5 text-white shadow-soft dark:bg-navy-800">
            <Link to="/compare" className="flex items-center gap-2 py-1.5 pr-2 text-sm font-medium hover:text-sky-300">
              <Scale className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">{t('nav.compare')}</span>
              <span className="md:hidden">{compareIds.length}</span>
              <span className="hidden md:inline">({compareIds.length})</span>
            </Link>
            <button
              type="button"
              onClick={clearCompare}
              aria-label="Clear comparison"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
