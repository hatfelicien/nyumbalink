import { BadgeCheck, Clock, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import type { VerificationStatus } from '../../types'
import { cn } from '../../utils/cn'

export interface VerificationBadgeProps {
  /** 'property' = ownership documents checked, 'landlord' = ID checked, 'full' = both. */
  kind: 'property' | 'landlord' | 'full'
  status?: VerificationStatus
  /** Solid fill for use on top of photos; the default tint is for plain backgrounds. */
  solid?: boolean
  /** Also render a badge for listings that are not verified, instead of nothing. */
  showUnverified?: boolean
  className?: string
}

const LABEL_KEY = {
  property: 'trust.verifiedProperty',
  landlord: 'trust.verifiedLandlord',
  full: 'trust.fullyVerified',
} as const

const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold'

export function VerificationBadge({ kind, status = 'verified', solid, showUnverified, className }: VerificationBadgeProps) {
  const { t } = useLanguage()

  if (status === 'verified') {
    const Icon = kind === 'landlord' ? ShieldCheck : BadgeCheck
    return (
      <span
        className={cn(
          base,
          solid ? 'bg-emerald-600 text-white shadow-soft' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          className,
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {t(LABEL_KEY[kind])}
      </span>
    )
  }

  if (!showUnverified) return null

  // A rejected submission is between the landlord and the reviewer — publicly it is just "not verified".
  const pending = status === 'pending'
  const Icon = pending ? Clock : ShieldQuestion
  return (
    <span
      className={cn(
        base,
        pending ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-navy-900/5 text-slate-500 dark:bg-white/10',
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {t(pending ? 'trust.inReview' : 'trust.notVerified')}
    </span>
  )
}
