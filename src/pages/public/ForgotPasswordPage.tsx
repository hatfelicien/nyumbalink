import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { z } from 'zod'
import { AuthCard } from '../../components/layout/AuthCard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { withDelay } from '../../services/delay'

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    await withDelay(() => undefined)
    setSentTo(values.email)
  }

  if (sentTo) {
    return (
      <AuthCard title="Check your inbox">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            If an account exists for <span className="font-medium text-navy-900 dark:text-white">{sentTo}</span>,
            a reset link has been sent. This is a demo — no email is actually sent.
          </p>
          <Link to="/login" className="mt-6 text-sm font-medium text-blue-500 hover:text-blue-400">
            Back to log in
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot password" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  )
}
