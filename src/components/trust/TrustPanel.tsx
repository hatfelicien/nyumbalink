import { useState } from 'react'
import { CheckCircle2, CircleDashed, Flag, TriangleAlert } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import type { Property, User } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'
import { trustLevel } from '../../utils/verification'
import { Card } from '../ui/Card'
import { ReportListingModal } from './ReportListingModal'
import { VerificationBadge } from './VerificationBadge'

function CheckRow({ passed, label, detail }: { passed: boolean; label: string; detail?: string }) {
  const Icon = passed ? CheckCircle2 : CircleDashed
  return (
    <li className="flex items-start gap-2.5">
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', passed ? 'text-emerald-500' : 'text-slate-500')} aria-hidden="true" />
      <div>
        <p className={cn('text-sm', passed ? 'font-medium text-navy-900 dark:text-white' : 'text-slate-500')}>{label}</p>
        {detail && <p className="text-xs text-slate-500">{detail}</p>}
      </div>
    </li>
  )
}

/** Spells out exactly which checks a listing has passed, so a badge is never just a decoration. */
export function TrustPanel({ property, owner }: { property: Property; owner: User }) {
  const { t } = useLanguage()
  const [reportOpen, setReportOpen] = useState(false)

  const level = trustLevel(property, owner)
  const propertyVerified = property.verification === 'verified'
  const ownerVerified = owner.verification === 'verified'

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-navy-900 dark:text-white">{t('trust.title')}</h2>
        {level === 'full' ? (
          <VerificationBadge kind="full" />
        ) : level === 'none' ? (
          <VerificationBadge kind="property" status={property.verification} showUnverified />
        ) : (
          <VerificationBadge kind={level} />
        )}
      </div>

      <ul className="space-y-3">
        <CheckRow
          passed={propertyVerified}
          label={t(propertyVerified ? 'trust.ownershipChecked' : 'trust.ownershipMissing')}
          detail={propertyVerified && property.verifiedAt ? formatDate(property.verifiedAt) : undefined}
        />
        <CheckRow
          passed={ownerVerified}
          label={t(ownerVerified ? 'trust.idChecked' : 'trust.idMissing')}
          detail={ownerVerified && owner.verifiedAt ? formatDate(owner.verifiedAt) : undefined}
        />
      </ul>

      {level !== 'full' && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t('trust.warning')}
        </p>
      )}

      <div className="border-t border-navy-700/10 pt-4 dark:border-navy-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('safety.title')}</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-500">
          <li>{t('safety.tip1')}</li>
          <li>{t('safety.tip2')}</li>
          <li>{t('safety.tip3')}</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={() => setReportOpen(true)}
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-rose-500"
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
        {t('property.report')}
      </button>

      <ReportListingModal open={reportOpen} onClose={() => setReportOpen(false)} property={property} />
    </Card>
  )
}
