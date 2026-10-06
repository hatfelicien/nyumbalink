import type { UseFormReturn } from 'react-hook-form'
import { Badge } from '../../ui/Badge'
import { AMENITIES, PROPERTY_TYPES } from '../../../utils/constants'
import { formatRwf } from '../../../utils/format'
import { totalMonthlyCosts } from '../../../utils/verification'
import type { WizardValues } from './wizardSchema'

export function StepReview({ form }: { form: UseFormReturn<WizardValues> }) {
  const values = form.watch()
  const typeLabel = PROPERTY_TYPES.find((t) => t.value === values.type)?.label ?? values.type
  const cover = values.images.find((img) => img.isCover) ?? values.images[0]

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-navy-700/10 dark:border-navy-700">
        {cover && <img src={cover.url} alt="Cover" className="h-48 w-full object-cover" />}
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{values.title || 'Untitled listing'}</h3>
                <Badge variant="brand">{values.purpose === 'sale' ? 'For sale' : 'For rent'}</Badge>
                {values.negotiable && <Badge variant="success">Negotiable</Badge>}
              </div>
              <p className="text-sm text-slate-500">{values.address || 'No address set'}</p>
            </div>
            <p className="text-xl font-semibold text-navy-900 dark:text-white">
              {formatRwf(values.price || 0)}
              {values.purpose === 'rent' && '/mo'}
            </p>
          </div>

          {values.purpose === 'rent' && values.cautionMoney > 0 && (
            <p className="mt-2 text-sm text-slate-500">Caution money: {formatRwf(values.cautionMoney)}</p>
          )}

          {values.purpose === 'rent' && (
            <p className="mt-1 text-sm text-slate-500">
              Estimated total per month: {formatRwf((values.price || 0) + totalMonthlyCosts(values.monthlyCosts))}
            </p>
          )}

          <p className="mt-3 text-sm leading-relaxed text-slate-500">{values.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-navy-900 dark:text-white">
            <span>{typeLabel}</span>
            <span>{values.bedrooms} bed</span>
            <span>{values.bathrooms} bath</span>
            <span>{values.sizeSqm} m²</span>
            <span>{values.furnished ? 'Furnished' : 'Unfurnished'}</span>
            <span>{values.locationPrecision === 'exact' ? 'Exact location shown' : 'General area shown'}</span>
          </div>

          {values.amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {values.amenities.map((amenity) => (
                <Badge key={amenity} variant="brand">
                  {AMENITIES.find((a) => a.value === amenity)?.label ?? amenity}
                </Badge>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500">{values.images.length} photo{values.images.length === 1 ? '' : 's'} attached</p>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Review the details above, then publish to make this listing visible to tenants, or save it as a draft to
        finish later. After publishing, submit your ownership documents under Verification to earn the "Verified
        property" badge.
      </p>
    </div>
  )
}
