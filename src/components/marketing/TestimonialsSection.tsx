import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { testimonials } from '../../data/testimonials'
import { Avatar } from '../ui/Avatar'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export function TestimonialsSection() {
  return (
    <section className="bg-navy-900 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white">Loved by tenants and owners</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">A few words from people who found their next place here.</p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mt-12 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0"
        >
          {testimonials.map((testimonial) => (
            <motion.figure
              key={testimonial.id}
              variants={itemVariants}
              className="flex w-[85%] shrink-0 snap-center flex-col rounded-2xl border border-white/10 bg-white/5 p-6 md:w-auto"
            >
              <Quote className="h-6 w-6 text-blue-400" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/80">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={testimonial.name} src={testimonial.avatar} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-white/50">{testimonial.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
