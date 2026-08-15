import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface LineChartPoint {
  label: string
  value: number
}

export function LineChart({ data, height = 220 }: { data: LineChartPoint[]; height?: number }) {
  const gradientId = useId()
  const reduceMotion = useReducedMotion()

  const width = 600
  const padding = 24
  const max = Math.max(...data.map((d) => d.value), 1)
  const min = Math.min(...data.map((d) => d.value), 0)
  const range = max - min || 1

  const points = data.map((point, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2)
    return { x, y, ...point }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Views over time chart">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={padding}
          x2={width - padding}
          y1={padding + fraction * (height - padding * 2)}
          y2={padding + fraction * (height - padding * 2)}
          className="stroke-navy-900/5 dark:stroke-white/10"
          strokeWidth={1}
        />
      ))}

      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="#2563EB"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />

      {points.map((point) => (
        <circle key={point.label} cx={point.x} cy={point.y} r={3} fill="#2563EB" />
      ))}

      {points.map((point) => (
        <text
          key={`label-${point.label}`}
          x={point.x}
          y={height - 4}
          textAnchor="middle"
          className="fill-slate-500"
          fontSize={10}
        >
          {point.label}
        </text>
      ))}
    </svg>
  )
}
