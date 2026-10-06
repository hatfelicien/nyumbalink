import { useId } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface TabItem {
  value: string
  label: string
  count?: number
}

export interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  const layoutId = useId()

  return (
    <div role="tablist" className={cn('flex items-center gap-1 overflow-x-auto border-b border-navy-700/10 scrollbar-none dark:border-navy-700', className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4',
              active ? 'text-blue-500' : 'text-slate-500 hover:text-navy-900 dark:hover:text-white',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="rounded-full bg-navy-900/5 px-1.5 py-0.5 text-xs dark:bg-white/10">{item.count}</span>
            )}
            {active && (
              <motion.span
                layoutId={`tabs-indicator-${layoutId}`}
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-500"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
