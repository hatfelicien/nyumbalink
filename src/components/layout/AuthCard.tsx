import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'

export interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] md:min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card>
          <h1 className="text-2xl font-semibold text-navy-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </Card>
        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </motion.div>
    </div>
  )
}
