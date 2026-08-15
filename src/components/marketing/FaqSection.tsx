import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    question: 'Is there a fee to browse or contact owners?',
    answer: 'No. Browsing listings and contacting owners through NyumbaLink is completely free for tenants.',
  },
  {
    question: 'How do I know a listing is genuine?',
    answer:
      'Owners go through an application review before they can publish listings, and every listing shows an exact map pin so you can verify the location before visiting.',
  },
  {
    question: 'Can I list more than one property?',
    answer: 'Yes. Once your owner account is approved you can add as many properties as you manage from your dashboard.',
  },
  {
    question: 'Do prices include utilities?',
    answer: 'This varies by listing. Always confirm what is included directly with the owner before agreeing to a lease.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-navy-900 dark:text-white">Frequently asked questions</h2>
      </div>

      <div className="mt-10 divide-y divide-navy-700/10 rounded-2xl border border-navy-700/10 dark:divide-navy-700 dark:border-navy-700">
        {FAQS.map((faq, index) => {
          const open = openIndex === index
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-navy-900 dark:text-white">{faq.question}</span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-slate-500">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
