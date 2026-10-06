import { motion } from 'framer-motion'
import { BadgeCheck, CalendarDays, FileText, KeyRound, PenLine, Search, Smartphone } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const STEPS = [
  {
    icon: Search,
    titleKey: 'journey.find',
    description: 'Filter by neighbourhood, budget, water, cash power and internet. Save a search to hear about new matches.',
  },
  {
    icon: BadgeCheck,
    titleKey: 'journey.verify',
    description: 'Look for the verified badges: the landlord’s ID and the property’s land title are checked by our team.',
  },
  {
    icon: CalendarDays,
    titleKey: 'journey.visit',
    description: 'Book a free viewing with the landlord directly. No commissionaire, no viewing fee.',
  },
  {
    icon: FileText,
    titleKey: 'journey.apply',
    description: 'Apply online in two minutes. The landlord sees who you are before anyone pays anything.',
  },
  {
    icon: PenLine,
    titleKey: 'journey.sign',
    description: 'Both sides sign the rental agreement on their phone, and each keeps a copy.',
  },
  {
    icon: Smartphone,
    titleKey: 'journey.pay',
    description: 'Pay the caution money by MTN MoMo or Airtel Money once the agreement is in place.',
  },
  {
    icon: KeyRound,
    titleKey: 'journey.manage',
    description: 'Report repairs and keep your agreement, messages and updates in one place.',
  },
] as const

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function HowItWorksSection() {
  const { t } = useLanguage()

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-navy-900 dark:text-white">How NyumbaLink works</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          One place for the whole rental, from the first search to the day something needs fixing.
        </p>
      </div>

      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
      >
        {STEPS.map((step, index) => (
          <motion.li
            key={step.titleKey}
            variants={itemVariants}
            className="relative flex gap-4 rounded-2xl border border-navy-700/10 bg-white p-4 transition-shadow hover:shadow-soft dark:border-navy-700 dark:bg-navy-800 sm:block sm:p-6"
          >
            <span className="absolute right-6 top-6 hidden text-4xl font-bold text-navy-900/5 dark:text-white/10 sm:block" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <step.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-navy-900 dark:text-white">{t(step.titleKey)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}
