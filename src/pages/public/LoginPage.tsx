import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { AuthCard } from '../../components/layout/AuthCard'
import { DemoCredentialsPanel } from '../../components/layout/DemoCredentialsPanel'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import type { Role } from '../../types'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  owner: '/owner',
  guest: '/',
}

export function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function performLogin(email: string, password: string) {
    try {
      const user = await login({ email, password })
      showToast('Welcome back', { description: `Signed in as ${user.name}`, variant: 'success' })
      navigate(returnTo ? decodeURIComponent(returnTo) : ROLE_HOME[user.role])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.'
      showToast('Sign-in failed', { description: message, variant: 'error' })
    }
  }

  async function onSubmit(values: LoginFormValues) {
    await performLogin(values.email, values.password)
  }

  function handleDemoSelect(email: string) {
    setValue('email', email)
    setValue('password', 'demo1234')
    void performLogin(email, 'demo1234')
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-blue-500 hover:text-blue-400">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <div>
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Link to="/forgot-password" className="mt-1.5 inline-block text-sm text-blue-500 hover:text-blue-400">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <div className="mt-6">
        <DemoCredentialsPanel onSelect={handleDemoSelect} loading={isSubmitting} />
      </div>
    </AuthCard>
  )
}
