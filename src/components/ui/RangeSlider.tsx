import { cn } from '../../utils/cn'

export interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
  label?: string
}

const thumbClasses =
  'pointer-events-none absolute inset-0 h-1.5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-soft [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:bg-white'

export function RangeSlider({ min, max, step = 1, value, onChange, formatValue, label }: RangeSliderProps) {
  const [low, high] = value
  const format = formatValue ?? ((v: number) => v.toLocaleString())
  const lowPercent = ((low - min) / (max - min)) * 100
  const highPercent = ((high - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {label && <p className="mb-2 text-sm font-medium text-navy-900 dark:text-white">{label}</p>}
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-navy-900/10 dark:bg-white/10" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-500"
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
        />
        <input
          type="range"
          aria-label={label ? `${label} minimum` : 'Minimum value'}
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), high - step)
            onChange([next, high])
          }}
          className={cn(thumbClasses, 'z-10')}
        />
        <input
          type="range"
          aria-label={label ? `${label} maximum` : 'Maximum value'}
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), low + step)
            onChange([low, next])
          }}
          className={cn(thumbClasses, 'z-20')}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm text-slate-500">
        <span>{format(low)}</span>
        <span>{format(high)}</span>
      </div>
    </div>
  )
}
