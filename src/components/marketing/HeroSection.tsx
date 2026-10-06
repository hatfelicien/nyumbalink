import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { HeroSearchBar } from './HeroSearchBar'

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-navy-950 pb-14 pt-12 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-6rem] top-10 h-[26rem] w-[26rem] rounded-full bg-sky-300/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-blue-400/20 blur-3xl"
          animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-sky-300 sm:px-4 sm:text-sm"
        >
          {t('hero.badge')}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-5 text-[2.1rem] font-bold leading-[1.08] tracking-tight text-white sm:mt-6 sm:text-5xl lg:text-display"
        >
          {t('hero.headline')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:mt-5 sm:text-lg"
        >
          {t('hero.subheadline')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-8 sm:mt-10"
        >
          <HeroSearchBar />
        </motion.div>
      </div>
    </section>
  )
}
