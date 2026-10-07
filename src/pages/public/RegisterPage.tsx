import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Search } from 'lucide-react'
import { z } from 'zod'
import { PasswordStrength } from '../../components/account/PasswordStrength'
import { AuthCard } from '../../components/layout/AuthCard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { formatRwandaPhone, isValidRwandaPhone } from '../../utils/phone'

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name'),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z.string().refine(isValidRwandaPhone, 'Enter a Rwandan mobile number, e.g. 078 812 3456'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'The passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        phone: formatRwandaPhone(values.phone),
        password: values.password,
      })
      showToast('Account created', { description: 'Welcome to NyumbaLink.', variant: 'success' })
      navigate('/')
    } catch (error) {
      setError('email', { message: error instanceof Error ? error.message : 'Unable to create your account.' })
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Choose the kind of account you need."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
            Log in
          </Link>
        </>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-2" role="tablist" aria-label="Account type">
        <div
          role="tab"
          aria-selected="true"
          className="flex flex-col items-start gap-1 rounded-xl border-2 border-blue-500 bg-blue-500/5 p-3"
        >
          <Search className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-navy-900 dark:text-white">I'm looking for a home</span>
          <span className="text-xs text-slate-500">Ready to use straight away</span>
        </div>
        <Link
          to="/become-an-owner"
          role="tab"
          aria-selected="false"
          className="flex flex-col items-start gap-1 rounded-xl border-2 border-navy-700/10 p-3 transition-colors hover:border-blue-400 dark:border-navy-700"
        >
          <Building2 className="h-5 w-5 text-slate-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-navy-900 dark:text-white">I own property</span>
          <span className="text-xs text-slate-500">Apply for a landlord account</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input label="Full name" autoComplete="name" {...register('name')} error={errors.name?.message} />
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
        <div>
          <Input label="Password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
          <PasswordStrength password={watch('password')} />
        </div>
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
