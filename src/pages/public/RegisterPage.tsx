import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthCard } from '../../components/layout/AuthCard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().min(8, 'Enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
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
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser({ name: values.name, email: values.email, phone: values.phone, password: values.password })
      showToast('Account created', { description: 'Welcome to NyumbaLink.', variant: 'success' })
      navigate('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create your account.'
      showToast('Sign-up failed', { description: message, variant: 'error' })
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Browse listings and message owners directly."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Input
          label="Confirm password"
          type="password"
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
