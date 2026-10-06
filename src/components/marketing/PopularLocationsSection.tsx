import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAsync } from '../../hooks/useAsync'
import { propertiesService } from '../../services/propertiesService'

const LOCATIONS = [
  { name: 'Kimironko', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80&auto=format&fit=crop' },
  { name: 'Nyarutarama', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80&auto=format&fit=crop' },
  { name: 'Kiyovu', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80&auto=format&fit=crop' },
  { name: 'Remera', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&auto=format&fit=crop' },
  { name: 'Kacyiru', image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600&q=80&auto=format&fit=crop' },
  { name: 'Kicukiro', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80&auto=format&fit=crop' },
]

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export function PopularLocationsSection() {
  const { data } = useAsync(() => propertiesService.list(), [])

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-navy-900 dark:text-white">Popular locations</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">Browse by the neighbourhoods tenants search for most.</p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        {LOCATIONS.map((location) => {
          const count = (data ?? []).filter(
            (p) => p.listingStatus === 'published' && p.district.toLowerCase().includes(location.name.toLowerCase()),
          ).length

          return (
            <motion.div key={location.name} variants={itemVariants}>
              <Link
                to={`/browse?location=${encodeURIComponent(location.name)}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl"
              >
                <img
                  src={location.image}
                  alt={location.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="text-sm font-semibold text-white">{location.name}</p>
                  <p className="text-xs text-white/70">{count} listing{count === 1 ? '' : 's'}</p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
