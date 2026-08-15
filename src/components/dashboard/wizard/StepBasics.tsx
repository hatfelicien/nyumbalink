import type { UseFormReturn } from 'react-hook-form'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { Textarea } from '../../ui/Textarea'
import { LISTING_PURPOSES, PROPERTY_TYPES } from '../../../utils/constants'
import { cn } from '../../../utils/cn'
import type { WizardValues } from './wizardSchema'

export function StepBasics({ form }: { form: UseFormReturn<WizardValues> }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const purpose = watch('purpose')

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1.5 text-sm font-medium text-navy-900 dark:text-white">Listing type</p>
        <div className="flex gap-2">
          {LISTING_PURPOSES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('purpose', option.value, { shouldValidate: true })}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                purpose === option.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                  : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <Input label="Listing title" placeholder="e.g. Modern 2-bedroom apartment in Kimironko" {...register('title')} error={errors.title?.message} />
      <Select label="Property type" options={PROPERTY_TYPES} {...register('type')} error={errors.type?.message} />
      <Textarea
        label="Description"
        rows={6}
        placeholder="Describe the property, the neighbourhood, and anything a tenant should know."
        {...register('description')}
        error={errors.description?.message}
      />
    </div>
  )
}
