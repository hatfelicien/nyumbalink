import { motion } from 'framer-motion'

export interface BarChartPoint {
  label: string
  value: number
}

export function BarChart({ data, height = 220 }: { data: BarChartPoint[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex items-end gap-3" style={{ height }} role="img" aria-label="Bar chart">
      {data.map((point, index) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(point.value / max) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
              className="w-full rounded-t-lg bg-blue-500"
              title={`${point.label}: ${point.value}`}
            />
          </div>
          <span className="text-xs text-slate-500">{point.label}</span>
        </div>
      ))}
    </div>
  )
}
