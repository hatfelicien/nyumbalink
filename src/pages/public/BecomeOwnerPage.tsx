import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { BadgeCheck, Building2, CheckCircle2, Clock, FileCheck2, Home, KeyRound, LogIn, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { z } from 'zod'
import { PasswordStrength } from '../../components/account/PasswordStrength'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { useAuth } from '../../context/AuthContext'
import { applicationsService } from '../../services/applicationsService'
import type { OwnerApplication } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'
import { formatRwandaPhone, isValidRwandaPhone } from '../../utils/phone'
import { validateNationalId } from '../../utils/verification'

const DISTRICTS = [
  { value: 'Gasabo', label: 'Gasabo (Kigali)' },
  { value: 'Kicukiro', label: 'Kicukiro (Kigali)' },
  { value: 'Nyarugenge', label: 'Nyarugenge (Kigali)' },
  { value: 'Outside Kigali', label: 'Outside Kigali' },
]

const PROPERTY_COUNTS = [
  { value: '1', label: '1 property' },
  { value: '2-5', label: '2–5 properties' },
  { value: '6-10', label: '6–10 properties' },
  { value: '10+', label: 'More than 10' },
]

const applicationSchema = z
  .object({
    name: z.string().trim().min(3, 'Enter your full name as it appears on your ID'),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z.string().refine(isValidRwandaPhone, 'Enter a Rwandan mobile number, e.g. 078 812 3456'),
    nationalId: z.string().superRefine((value, ctx) => {
      const problem = validateNationalId(value)
      if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, message: problem })
    }),
    district: z.string().min(1, 'Choose where your property is'),
    propertyCount: z.string().min(1, 'Choose how many properties you manage'),
    message: z.string().trim().min(20, 'Tell us a little more (20+ characters)').max(600, 'Keep it under 600 characters'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You need to accept the terms to apply' }) }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The passwords do not match',
  })

type ApplicationValues = z.infer<typeof applicationSchema>

const STEPS: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: FileCheck2, title: 'Apply', description: 'Create your landlord account with your ID and property details.' },
  { icon: Clock, title: 'We review', description: 'Our team checks your application before the account is switched on.' },
  { icon: LogIn, title: 'Log in and list', description: 'Sign in, verify ownership and publish your first home.' },
]

const BENEFITS: { icon: LucideIcon; text: string }[] = [
  { icon: Users, text: 'Reach tenants across Kigali without paying commissionaires' },
  { icon: BadgeCheck, text: 'Verified badges that tenants filter for' },
  { icon: Building2, text: 'Viewings, applications, contracts and repairs in one dashboard' },
]

function FormSection({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-navy-900 dark:text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">{number}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function SubmittedView({ application }: { application: OwnerApplication }) {
  const timeline = [
    { label: 'Application received', detail: formatDate(application.createdAt), state: 'done' as const },
    { label: 'Review by NyumbaLink', detail: 'An administrator checks your details', state: 'current' as const },
    { label: 'Account approved', detail: 'Log in, verify your property and start listing', state: 'next' as const },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-xl rounded-2xl border border-navy-700/10 bg-white p-6 text-center shadow-soft dark:border-navy-700 dark:bg-navy-800 sm:p-10"
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-navy-900 dark:text-white">Application submitted</h1>
      <p className="mt-2 text-slate-500">
        Thank you, {application.name.split(' ')[0]}. Your landlord account for <span className="font-medium text-navy-900 dark:text-white">{application.email}</span> has
        been created and is waiting for approval.
      </p>

      <ol className="mt-8 space-y-0 text-left">
        {timeline.map((step, index) => (
          <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
            {index < timeline.length - 1 && (
              <span className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-0.5 bg-navy-900/10 dark:bg-white/10" aria-hidden="true" />
            )}
            <span
              className={cn(
                'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                step.state === 'done' && 'bg-emerald-500 text-white',
                step.state === 'current' && 'bg-amber-500 text-white',
                step.state === 'next' && 'border-2 border-navy-900/15 bg-white dark:border-white/20 dark:bg-navy-800',
              )}
            >
              {step.state === 'done' && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              {step.state === 'current' && <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
            <div>
              <p className={cn('text-sm font-semibold', step.state === 'next' ? 'text-slate-500' : 'text-navy-900 dark:text-white')}>
                {step.label}
                {step.state === 'current' && (
                  <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    In progress
                  </span>
                )}
              </p>
              <p className="text-sm text-slate-500">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-8 rounded-xl bg-navy-900/[0.03] p-4 text-sm text-slate-500 dark:bg-white/5">
        You can try logging in at any time to check your status. Sign-in opens as soon as an administrator approves your
        application.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to={`/login?email=${encodeURIComponent(application.email)}`}>
          <Button className="w-full sm:w-auto" icon={<KeyRound className="h-4 w-4" />}>
            Check my status
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" className="w-full sm:w-auto" icon={<Home className="h-4 w-4" />}>
            Back to home
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export function BecomeOwnerPage() {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState<OwnerApplication | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      nationalId: '',
      district: '',
      propertyCount: '',
      message: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  })

  const password = watch('password')

  async function onSubmit(values: ApplicationValues) {
    try {
      const application = await applicationsService.apply({
        name: values.name,
        email: values.email,
        phone: formatRwandaPhone(values.phone),
        password: values.password,
        nationalId: values.nationalId.replace(/\s/g, ''),
        city: values.district === 'Outside Kigali' ? 'Rwanda' : 'Kigali',
        district: values.district,
        propertyCount: values.propertyCount,
        message: values.message.trim(),
      })
      setSubmitted(application)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setError('email', { message: error instanceof Error ? error.message : 'Could not submit your application.' })
    }
  }

  if (submitted) {
    return (
      <div className="px-4 py-8 sm:px-6 sm:py-14">
        <SubmittedView application={submitted} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">For landlords</p>
          <h1 className="mt-2 text-[1.75rem] font-bold leading-tight text-navy-900 dark:text-white sm:text-4xl">
            List your property on NyumbaLink
          </h1>
          <p className="mt-3 text-slate-500">
            Apply for a landlord account. Every account is reviewed before it is switched on, which is how tenants know the
            people behind our listings are real.
          </p>

          <ol className="mt-6 space-y-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3 rounded-xl border border-navy-700/10 bg-white p-3.5 dark:border-navy-700 dark:bg-navy-800">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
                  <step.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">
                    {index + 1}. {step.title}
                  </p>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="mt-6 hidden space-y-2.5 lg:block">
            {BENEFITS.map((benefit) => (
              <li key={benefit.text} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <benefit.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                {benefit.text}
              </li>
            ))}
          </ul>
        </aside>

        <div className="rounded-2xl border border-navy-700/10 bg-white p-5 shadow-soft dark:border-navy-700 dark:bg-navy-800 sm:p-8">
          {user && (
            <p className="mb-6 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
              You are signed in as {user.name}. A landlord account is separate from a tenant account, so use a different email
              address below.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            <FormSection number={1} title="Your details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" autoComplete="name" {...register('name')} error={errors.name?.message} hint="As it appears on your ID" />
                <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
                <Input
                  label="Phone number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="078 812 3456"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
                <Input
                  label="National ID number"
                  inputMode="numeric"
                  placeholder="1 1987 8 0012345 6 78"
                  {...register('nationalId')}
                  error={errors.nationalId?.message}
                  hint="Only our review team sees this"
                />
              </div>
            </FormSection>

            <FormSection number={2} title="Your property">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Where is it?" placeholder="Choose a district" options={DISTRICTS} {...register('district')} error={errors.district?.message} />
                <Select
                  label="How many do you manage?"
                  placeholder="Choose one"
                  options={PROPERTY_COUNTS}
                  {...register('propertyCount')}
                  error={errors.propertyCount?.message}
                />
              </div>
              <Textarea
                label="Tell us about your property"
                rows={4}
                placeholder="e.g. Two 3-bedroom houses in Kicukiro, available from November. I hold the land titles myself."
                {...register('message')}
                error={errors.message?.message}
              />
            </FormSection>

            <FormSection number={3} title="Create your password">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Input label="Password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
                  <PasswordStrength password={password} />
                </div>
                <Input
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </FormSection>

            <div className="space-y-5 border-t border-navy-700/10 pt-6 dark:border-navy-700">
              <div>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-navy-900 dark:text-white">
                  <input type="checkbox" {...register('acceptTerms')} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-blue-500" />
                  <span>
                    I confirm the details above are true and I accept the{' '}
                    <Link to="/terms" target="_blank" className="font-medium text-blue-500 hover:text-blue-400">
                      terms of service
                    </Link>
                    .
                  </span>
                </label>
                {errors.acceptTerms && <p className="mt-1.5 text-sm text-rose-500">{errors.acceptTerms.message}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                Submit application
              </Button>
              <p className="text-center text-sm text-slate-500">
                Already applied?{' '}
                <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
                  Log in to check your status
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
