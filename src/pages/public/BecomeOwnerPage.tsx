import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2 } from 'lucide-react'
import { z } from 'zod'
import { AuthCard } from '../../components/layout/AuthCard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { applicationsService } from '../../services/applicationsService'

const applicationSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  city: z.string().min(2, 'Enter your city'),
  message: z.string().min(10, 'Tell us a little about your property'),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

export function BecomeOwnerPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { name: '', email: '', phone: '', city: '', message: '' },
  })

  async function onSubmit(values: ApplicationFormValues) {
    await applicationsService.create({
      name: values.name,
      email: values.email,
      phone: values.phone,
      city: values.city,
      message: values.message,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <AuthCard title="Application received">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Thank you. An administrator will review your application and follow up by email once your owner
            account is approved.
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Become an owner" subtitle="List your properties and manage enquiries in one place.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        <Input label="City" {...register('city')} error={errors.city?.message} />
        <Textarea
          label="Tell us about your property"
          rows={4}
          {...register('message')}
          error={errors.message?.message}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Submit application
        </Button>
      </form>
    </AuthCard>
  )
}
