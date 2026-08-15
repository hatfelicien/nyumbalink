import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '../../../utils/cn'

export interface WizardStep {
  title: string
}

export function WizardProgressBar({ steps, currentStep }: { steps: WizardStep[]; currentStep: number }) {
  const progress = (currentStep / (steps.length - 1)) * 100

  return (
    <div>
      <div className="relative h-1.5 w-full rounded-full bg-navy-900/10 dark:bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <ol className="mt-4 grid grid-cols-5 gap-2 text-xs">
        {steps.map((step, index) => {
          const complete = index < currentStep
          const active = index === currentStep
          return (
            <li key={step.title} className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
                  complete && 'bg-blue-500 text-white',
                  active && !complete && 'bg-blue-500/10 text-blue-500 ring-2 ring-blue-500',
                  !active && !complete && 'bg-navy-900/5 text-slate-500 dark:bg-white/10',
                )}
              >
                {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
              </span>
              <span className={cn('hidden sm:block', active ? 'font-medium text-navy-900 dark:text-white' : 'text-slate-500')}>
                {step.title}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
