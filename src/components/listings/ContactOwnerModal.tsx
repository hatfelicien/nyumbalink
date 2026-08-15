import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { enquiriesService } from '../../services/enquiriesService'
import type { Property } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Textarea } from '../ui/Textarea'

const contactSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  message: z.string().min(10, 'Message should be at least 10 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export interface ContactOwnerModalProps {
  open: boolean
  onClose: () => void
  property: Property
}

export function ContactOwnerModal({ open, onClose, property }: ContactOwnerModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      message: `Hi, I am interested in "${property.title}". Is it still available?`,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        message: `Hi, I am interested in "${property.title}". Is it still available?`,
      })
    }
  }, [open, user, property.title, reset])

  async function onSubmit(values: ContactFormValues) {
    await enquiriesService.create({
      propertyId: property.id,
      ownerId: property.ownerId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      message: values.message,
    })
    showToast('Message sent', { description: 'The owner will get back to you soon.', variant: 'success' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Contact owner" description={`About "${property.title}"`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        <Textarea label="Message" rows={4} {...register('message')} error={errors.message?.message} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send message
        </Button>
      </form>
    </Modal>
  )
}
