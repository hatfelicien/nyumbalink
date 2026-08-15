import { motion } from 'framer-motion'
import { MessageCircle, Search, Send } from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    title: 'Search and filter',
    description: 'Set your budget, district, and must-have amenities. Results update instantly as you narrow down.',
  },
  {
    icon: MessageCircle,
    title: 'Contact the owner',
    description: 'See the exact location on the map, then reach out directly through the listing — no agents in between.',
  },
  {
    icon: Send,
    title: 'Move in',
    description: 'Agree on terms with the owner and move in. Your account keeps track of everything you have enquired about.',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-navy-900 dark:text-white">How NyumbaLink works</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">Three steps between browsing and getting the keys.</p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="mt-12 grid gap-6 sm:grid-cols-3"
      >
        {STEPS.map((step, index) => (
          <motion.div key={step.title} variants={itemVariants} className="relative rounded-2xl border border-navy-700/10 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
            <span className="absolute right-6 top-6 text-4xl font-bold text-navy-900/5 dark:text-white/10">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <step.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-navy-900 dark:text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
