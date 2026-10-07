import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Ban, Clock, XCircle } from 'lucide-react'
import { z } from 'zod'
import { AuthCard } from '../../components/layout/AuthCard'
import { DemoCredentialsPanel } from '../../components/layout/DemoCredentialsPanel'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../hooks/useToast'
import { LoginError } from '../../services/authService'
import type { Role } from '../../types'
import { cn } from '../../utils/cn'

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

/** Account states that are not "wrong details" get a panel explaining what happens next. */
const STATUS_PANEL = {
  pending: { icon: Clock, classes: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200' },
  rejected: { icon: XCircle, classes: 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200' },
  suspended: { icon: Ban, classes: 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200' },
} as const

interface AccountNotice {
  reason: keyof typeof STATUS_PANEL
  title: string
  detail?: string
}

export function LoginPage() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const [notice, setNotice] = useState<AccountNotice | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: searchParams.get('email') ?? '', password: '' },
  })

  async function performLogin(email: string, password: string) {
    setNotice(null)
    try {
      const user = await login({ email, password })
      showToast('Welcome back', { description: `Signed in as ${user.name}`, variant: 'success' })
      navigate(returnTo ? decodeURIComponent(returnTo) : ROLE_HOME[user.role])
    } catch (error) {
      if (error instanceof LoginError && error.reason in STATUS_PANEL) {
        setNotice({ reason: error.reason as AccountNotice['reason'], title: error.message, detail: error.detail })
      } else if (error instanceof LoginError && error.reason === 'wrong-password') {
        setError('password', { message: error.message })
      } else if (error instanceof LoginError && error.reason === 'not-found') {
        setError('email', { message: error.message })
      } else {
        showToast('Sign-in failed', { description: error instanceof Error ? error.message : 'Unable to sign in.', variant: 'error' })
      }
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

  const panel = notice ? STATUS_PANEL[notice.reason] : null

  return (
    <AuthCard
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <div className="space-y-2">
          <p>
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-medium text-blue-500 hover:text-blue-400">
              {t('auth.login.signUp')}
            </Link>
          </p>
          <p>
            Own property?{' '}
            <Link to="/become-an-owner" className="font-medium text-blue-500 hover:text-blue-400">
              Apply for a landlord account
            </Link>
          </p>
        </div>
      }
    >
      {notice && panel && (
        <div role="alert" className={cn('mb-5 flex gap-3 rounded-xl border p-4 text-sm', panel.classes)}>
          <panel.icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{notice.title}</p>
            {notice.detail && <p className="mt-1 leading-relaxed opacity-90">{notice.detail}</p>}
            {notice.reason === 'rejected' && (
              <p className="mt-2">
                <Link to="/contact" className="font-medium underline underline-offset-2">
                  Contact us
                </Link>{' '}
                if you have questions.
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input label={t('auth.login.email')} type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
        <div>
          <Input
            label={t('auth.login.password')}
            type="password"
            autoComplete="current-password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Link to="/forgot-password" className="mt-1.5 inline-block text-sm text-blue-500 hover:text-blue-400">
            {t('auth.login.forgot')}
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          {t('auth.login.submit')}
        </Button>
      </form>

      <div className="mt-6">
        <DemoCredentialsPanel onSelect={handleDemoSelect} loading={isSubmitting} />
      </div>
    </AuthCard>
  )
}
