import { Building2, MapPinned, ShieldCheck, Users } from 'lucide-react'
import { useCountUp } from '../../hooks/useCountUp'

const STATS = [
  { icon: Building2, value: 24, label: 'Active listings' },
  { icon: Users, value: 1240, label: 'Registered tenants' },
  { icon: MapPinned, value: 3, label: 'Districts covered' },
  { icon: ShieldCheck, value: 5, label: 'Verified owners' },
]

function StatItem({ icon: Icon, value, label }: (typeof STATS)[number]) {
  const animated = useCountUp(value)
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-bold text-navy-900 dark:text-white">{animated.toLocaleString()}+</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="border-y border-navy-700/10 bg-white py-14 dark:border-navy-700 dark:bg-navy-800">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  )
}
