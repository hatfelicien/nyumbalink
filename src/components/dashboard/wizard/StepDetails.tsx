import type { UseFormReturn } from 'react-hook-form'
import { Input } from '../../ui/Input'
import { AMENITIES } from '../../../utils/constants'
import { cn } from '../../../utils/cn'
import type { WizardValues } from './wizardSchema'

export function StepDetails({ form }: { form: UseFormReturn<WizardValues> }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const furnished = watch('furnished')
  const amenities = watch('amenities')
  const purpose = watch('purpose')
  const negotiable = watch('negotiable')
  const isRent = purpose === 'rent'

  function toggleAmenity(value: string) {
    const next = amenities.includes(value) ? amenities.filter((a) => a !== value) : [...amenities, value]
    setValue('amenities', next, { shouldValidate: true })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={isRent ? 'Monthly rent (RWF)' : 'Sale price (RWF)'}
          type="number"
          min={0}
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
        />
        {isRent && (
          <Input
            label="Caution money (RWF)"
            hint="Refundable deposit collected before move-in"
            type="number"
            min={0}
            {...register('cautionMoney', { valueAsNumber: true })}
            error={errors.cautionMoney?.message}
          />
        )}
        <Input
          label="Size (m²)"
          type="number"
          min={0}
          {...register('sizeSqm', { valueAsNumber: true })}
          error={errors.sizeSqm?.message}
        />
        <Input
          label="Bedrooms"
          type="number"
          min={0}
          {...register('bedrooms', { valueAsNumber: true })}
          error={errors.bedrooms?.message}
        />
        <Input
          label="Bathrooms"
          type="number"
          min={0}
          {...register('bathrooms', { valueAsNumber: true })}
          error={errors.bathrooms?.message}
        />
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-navy-700/15 px-3.5 py-3 dark:border-navy-700">
        <div>
          <p className="text-sm font-medium text-navy-900 dark:text-white">Price is negotiable</p>
          <p className="text-xs text-slate-500">Shows a "Negotiable" tag to guests browsing this listing.</p>
        </div>
        <input
          type="checkbox"
          checked={negotiable}
          onChange={(e) => setValue('negotiable', e.target.checked)}
          className="h-5 w-5 rounded border-navy-700/30 text-blue-500 focus-visible:ring-blue-400"
        />
      </label>

      <div>
        <p className="mb-1.5 text-sm font-medium text-navy-900 dark:text-white">Furnished</p>
        <div className="flex gap-2">
          {[{ label: 'Furnished', value: true }, { label: 'Unfurnished', value: false }].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setValue('furnished', option.value)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                furnished === option.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                  : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-navy-900 dark:text-white">Amenities</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES.map((amenity) => {
            const checked = amenities.includes(amenity.value)
            return (
              <label
                key={amenity.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                  checked
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
                )}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleAmenity(amenity.value)} className="sr-only" />
                <amenity.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {amenity.label}
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
