import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '../../hooks/useToast'
import { rentalApplicationsService } from '../../services/rentalsService'
import type { Property } from '../../types'
import { formatRwf } from '../../utils/format'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'

const LEASE_OPTIONS = [
  { value: '3', label: '3 months' },
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
]

const applicationSchema = z.object({
  moveInDate: z.string().min(1, 'Choose a move-in date'),
  leaseMonths: z.coerce.number().min(1),
  occupants: z.coerce.number().min(1, 'At least one person').max(20, 'Check the number of occupants'),
  occupation: z.string().min(3, 'Tell the landlord what you do'),
  monthlyIncome: z.coerce.number().min(0, 'Cannot be negative'),
  message: z.string().min(10, 'Add a short message (10+ characters)'),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

const DEFAULTS: ApplicationFormValues = {
  moveInDate: '',
  leaseMonths: 12,
  occupants: 1,
  occupation: '',
  monthlyIncome: 0,
  message: '',
}

export interface RentalApplicationModalProps {
  open: boolean
  onClose: () => void
  property: Property
  tenantId: string
}

export function RentalApplicationModal({ open, onClose, property, tenantId }: RentalApplicationModalProps) {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({ resolver: zodResolver(applicationSchema), defaultValues: DEFAULTS })

  useEffect(() => {
    if (open) reset(DEFAULTS)
  }, [open, reset])

  async function onSubmit(values: ApplicationFormValues) {
    if (await rentalApplicationsService.findOpen(property.id, tenantId)) {
      setError('message', { message: 'You already have an application for this home. Find it under My rentals.' })
      return
    }
    await rentalApplicationsService.submit({
      propertyId: property.id,
      tenantId,
      ownerId: property.ownerId,
      moveInDate: values.moveInDate,
      leaseMonths: values.leaseMonths,
      occupants: values.occupants,
      occupation: values.occupation,
      monthlyIncome: values.monthlyIncome || undefined,
      message: values.message,
    })
    showToast('Application sent', {
      description: 'If the landlord approves, you will receive the rental agreement to sign here.',
      variant: 'success',
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Apply to rent"
      description={`"${property.title}" — ${formatRwf(property.price)}/month, ${formatRwf(property.cautionMoney)} deposit.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Move-in date" type="date" {...register('moveInDate')} error={errors.moveInDate?.message} />
          <Select label="Lease length" options={LEASE_OPTIONS} {...register('leaseMonths')} error={errors.leaseMonths?.message} />
          <Input label="People moving in" type="number" min={1} {...register('occupants')} error={errors.occupants?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Occupation"
            placeholder="e.g. Nurse at King Faisal Hospital"
            {...register('occupation')}
            error={errors.occupation?.message}
          />
          <Input
            label="Monthly income in RWF (optional)"
            type="number"
            min={0}
            {...register('monthlyIncome')}
            error={errors.monthlyIncome?.message}
            hint="Only the landlord sees this."
          />
        </div>
        <Textarea
          label="Message to the landlord"
          rows={4}
          placeholder="Introduce yourself and mention anything that helps, such as a reference from your current landlord."
          {...register('message')}
          error={errors.message?.message}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send application
        </Button>
        <p className="text-center text-xs text-slate-500">No payment is needed to apply.</p>
      </form>
    </Modal>
  )
}
