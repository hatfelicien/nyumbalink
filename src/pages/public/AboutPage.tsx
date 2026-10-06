import { motion } from 'framer-motion'
import { HeartHandshake, MapPinned, ShieldCheck } from 'lucide-react'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Verified listings',
    description: 'Landlords prove their identity and their right to rent each home. Look for the verified badges on every listing.',
  },
  {
    icon: MapPinned,
    title: 'Exact locations',
    description: 'No vague neighbourhood names — every listing shows the real pin so you know what you are getting into.',
  },
  {
    icon: HeartHandshake,
    title: 'Direct connection',
    description: 'You message the owner directly. No commission, no middlemen adding a markup to your rent.',
  },
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-[1.75rem] font-semibold leading-tight text-navy-900 dark:text-white sm:text-4xl">About NyumbaLink</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500">
          NyumbaLink is a rental platform built for Kigali's housing market. We connect tenants directly with
          property owners across Nyarugenge, Gasabo, and Kicukiro — from budget shared rooms to executive
          villas — with transparent pricing and exact map locations for every listing.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {VALUES.map((value, index) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="rounded-2xl border border-navy-700/10 bg-white p-6 dark:border-navy-700 dark:bg-navy-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <value.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-navy-900 dark:text-white">{value.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{value.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-navy-900 p-8 text-white sm:p-10">
        <h2 className="text-xl font-semibold">Our story</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
          We started NyumbaLink after watching friends spend weeks scrolling through WhatsApp groups and
          Facebook posts trying to find a place to rent — often with no photos, no map pin, and no way to
          confirm a listing was genuine. NyumbaLink puts everything in one place: filters that actually work,
          maps you can trust, and a direct line to the owner.
        </p>
      </div>
    </div>
  )
}
