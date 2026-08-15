import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { User } from '../../types'

const ownerFormSchema = z.object({
  name: z.string().min(2, 'Enter a full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  city: z.string().min(2, 'Enter a city'),
  nationalId: z.string().min(5, 'Enter a valid national ID'),
  status: z.enum(['active', 'suspended', 'pending']),
})

export type OwnerFormValues = z.infer<typeof ownerFormSchema>

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
]

export interface OwnerFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: OwnerFormValues) => Promise<void>
  owner?: User | null
}

export function OwnerFormModal({ open, onClose, onSubmit, owner }: OwnerFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: { name: '', email: '', phone: '', city: '', nationalId: '', status: 'active' },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: owner?.name ?? '',
        email: owner?.email ?? '',
        phone: owner?.phone ?? '',
        city: owner?.city ?? '',
        nationalId: owner?.nationalId ?? '',
        status: owner?.status ?? 'active',
      })
    }
  }, [open, owner, reset])

  return (
    <Modal open={open} onClose={onClose} title={owner ? 'Edit owner' : 'Add owner'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" {...register('city')} error={errors.city?.message} />
          <Input label="National ID" {...register('nationalId')} error={errors.nationalId?.message} />
        </div>
        <Select label="Status" options={STATUS_OPTIONS} {...register('status')} error={errors.status?.message} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          {owner ? 'Save changes' : 'Add owner'}
        </Button>
      </form>
    </Modal>
  )
}
