import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PropertyCard } from '../listings/PropertyCard'
import { PropertyCardSkeleton } from '../listings/PropertyCardSkeleton'
import { ErrorState } from '../ui/ErrorState'
import { useAsync } from '../../hooks/useAsync'
import { propertiesService } from '../../services/propertiesService'

export function FeaturedListingsSection() {
  const { data, loading, error, reload } = useAsync(() => propertiesService.list(), [])

  const featured = (data ?? [])
    .filter((p) => p.listingStatus === 'published')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)

  return (
    <section className="bg-slate-50 py-16 dark:bg-navy-950/40 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-navy-900 dark:text-white">Featured listings</h2>
            <p className="mt-2 text-slate-500">Highly rated homes available right now.</p>
          </div>
          <Link
            to="/browse"
            className="hidden items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-400 sm:flex"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {error ? (
          <ErrorState onRetry={reload} description="We could not load featured listings." />
        ) : (
          <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:mx-0 sm:gap-5 sm:px-0">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[78%] max-w-[18rem] shrink-0 snap-start sm:w-72">
                    <PropertyCardSkeleton />
                  </div>
                ))
              : featured.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="w-[78%] max-w-[18rem] shrink-0 snap-start sm:w-72"
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
          </div>
        )}
      </div>
    </section>
  )
}
