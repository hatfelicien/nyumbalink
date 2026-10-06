import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import { PropertyCard } from '../listings/PropertyCard'
import { useAsync } from '../../hooks/useAsync'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'
import { propertiesService } from '../../services/propertiesService'

export function RecentlyViewedSection() {
  const { recentIds } = useRecentlyViewed()
  const { data } = useAsync(() => propertiesService.list(), [])

  if (recentIds.length === 0) return null

  const recent = recentIds
    .map((id) => data?.find((property) => property.id === id))
    .filter((property): property is NonNullable<typeof property> => Boolean(property))

  if (recent.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
        <h2 className="text-2xl font-semibold text-navy-900 dark:text-white">Recently viewed</h2>
      </div>

      <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:gap-5 sm:px-0">
        {recent.map((property, index) => (
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
    </section>
  )
}
