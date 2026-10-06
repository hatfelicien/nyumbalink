import { useLanguage } from '../../context/LanguageContext'
import type { MonthlyCosts, Property } from '../../types'
import { formatRwf } from '../../utils/format'
import { totalMonthlyCosts } from '../../utils/verification'

export const COST_LABELS: { key: keyof MonthlyCosts; label: string; hint: string }[] = [
  { key: 'water', label: 'Water', hint: 'WASAC' },
  { key: 'electricity', label: 'Electricity', hint: 'cash power' },
  { key: 'internet', label: 'Internet', hint: 'home fibre or 4G' },
  { key: 'security', label: 'Security', hint: 'umutekano' },
  { key: 'garbage', label: 'Garbage collection', hint: 'isuku' },
]

/** What a month in this home really costs: rent plus the bills the landlord expects the tenant to cover. */
export function CostBreakdown({ property }: { property: Property }) {
  const { t } = useLanguage()
  const extras = totalMonthlyCosts(property.monthlyCosts)

  return (
    <div className="rounded-2xl border border-navy-700/10 dark:border-navy-700">
      <dl className="divide-y divide-navy-700/10 text-sm dark:divide-navy-700">
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-navy-900 dark:text-white">Rent</dt>
          <dd className="font-medium text-navy-900 dark:text-white">{formatRwf(property.price)}</dd>
        </div>
        {COST_LABELS.map(({ key, label, hint }) => (
          <div key={key} className="flex items-center justify-between px-4 py-3">
            <dt className="text-slate-500">
              {label} <span className="text-xs">({hint})</span>
            </dt>
            <dd className="text-navy-900 dark:text-white">
              {property.monthlyCosts[key] > 0 ? `~ ${formatRwf(property.monthlyCosts[key])}` : 'Included'}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between bg-navy-900/[0.03] px-4 py-3.5 dark:bg-white/5">
          <dt className="font-semibold text-navy-900 dark:text-white">{t('property.totalMonthly')}</dt>
          <dd className="text-lg font-bold text-navy-900 dark:text-white">{formatRwf(property.price + extras)}</dd>
        </div>
      </dl>
      <p className="border-t border-navy-700/10 px-4 py-3 text-xs text-slate-500 dark:border-navy-700">
        Bills are the landlord's estimates and vary with use.
        {property.cautionMoney > 0 && ` One-off before move-in: ${formatRwf(property.cautionMoney)} refundable caution money.`}
      </p>
    </div>
  )
}
