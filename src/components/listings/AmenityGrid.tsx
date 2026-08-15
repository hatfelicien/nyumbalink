import type { Amenity } from '../../types'
import { AMENITIES } from '../../utils/constants'

export function AmenityGrid({ amenities }: { amenities: Amenity[] }) {
  if (amenities.length === 0) return <p className="text-sm text-slate-500">No amenities listed.</p>

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {AMENITIES.filter((a) => amenities.includes(a.value)).map((amenity) => (
        <div
          key={amenity.value}
          className="flex items-center gap-2.5 rounded-xl border border-navy-700/10 px-3.5 py-3 text-sm text-navy-900 dark:border-navy-700 dark:text-white"
        >
          <amenity.icon className="h-[18px] w-[18px] shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
          {amenity.label}
        </div>
      ))}
    </div>
  )
}
