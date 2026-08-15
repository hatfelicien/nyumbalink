import type { UseFormReturn } from 'react-hook-form'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { Textarea } from '../../ui/Textarea'
import { PROPERTY_TYPES } from '../../../utils/constants'
import type { WizardValues } from './wizardSchema'

export function StepBasics({ form }: { form: UseFormReturn<WizardValues> }) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-5">
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
