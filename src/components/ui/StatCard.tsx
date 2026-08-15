import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useCountUp } from '../../hooks/useCountUp'
import { Card } from './Card'
import { cn } from '../../utils/cn'

export interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  format?: (value: number) => string
  trend?: { value: number; label: string }
}

export function StatCard({ label, value, icon: Icon, format, trend }: StatCardProps) {
  const animated = useCountUp(value)
  const positive = trend ? trend.value >= 0 : true

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-semibold text-navy-900 dark:text-white">
          {format ? format(animated) : animated.toLocaleString()}
        </p>
        {trend && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-sm font-medium',
              positive ? 'text-emerald-500' : 'text-rose-500',
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            )}
            {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </Card>
  )
}
