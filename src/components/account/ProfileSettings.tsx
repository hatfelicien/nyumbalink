import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Camera, Check, KeyRound, LogOut, Palette, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLogout } from '../../hooks/useLogout'
import { useToast } from '../../hooks/useToast'
import { usersService } from '../../services/usersService'
import type { User } from '../../types'
import { formatDate } from '../../utils/format'
import { resizeToSquare } from '../../utils/image'
import { formatRwandaPhone, isValidRwandaPhone, phoneNetwork } from '../../utils/phone'
import { PreferencesPanel } from '../layout/PreferencesPanel'
import { VerificationBadge } from '../trust/VerificationBadge'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'

const CITIES = ['Kigali', 'Musanze', 'Huye', 'Rubavu', 'Rusizi', 'Muhanga', 'Nyagatare', 'Rwamagana', 'Other']
const BIO_MAX = 300
const MAX_PHOTO_BYTES = 8 * 1024 * 1024

const ROLE_LABEL = { guest: 'Tenant', owner: 'Landlord', admin: 'Administrator' } as const

const profileSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(80, 'Keep it under 80 characters'),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z.string().refine(isValidRwandaPhone, 'Enter a Rwandan mobile number, e.g. 078 812 3456'),
    whatsappSame: z.boolean(),
    whatsapp: z.string(),
    city: z.string().min(1, 'Choose your city'),
    bio: z.string().max(BIO_MAX, `Keep it under ${BIO_MAX} characters`),
  })
  .refine((values) => values.whatsappSame || isValidRwandaPhone(values.whatsapp), {
    path: ['whatsapp'],
    message: 'Enter a Rwandan mobile number for WhatsApp',
  })

type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Enter your current password'),
    next: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirm: z.string(),
  })
  .refine((values) => values.next === values.confirm, { path: ['confirm'], message: 'The passwords do not match' })

type PasswordValues = z.infer<typeof passwordSchema>

function toFormValues(user: User): ProfileValues {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    whatsappSame: !user.whatsapp || user.whatsapp === user.phone,
    whatsapp: user.whatsapp ?? '',
    city: user.city ?? 'Kigali',
    bio: user.bio ?? '',
  }
}

function Section({
  icon: Icon,
  title,
  description,
  children,
  id,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
  id?: string
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-navy-700/10 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <header className="flex items-start gap-3 border-b border-navy-700/10 px-5 py-4 dark:border-navy-700 sm:px-6">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}

function PhotoCard({ user }: { user: User }) {
  const { updateUser } = useAuth()
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const hasPhoto = Boolean(user.avatar)

  async function savePhoto(avatar: string, message: string) {
    setBusy(true)
    try {
      const updated = await usersService.updateProfile(user, { avatar })
      updateUser(updated)
      showToast(message, { variant: 'success' })
    } finally {
      setBusy(false)
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Choose an image file', { description: 'JPG, PNG or WebP photos work best.', variant: 'error' })
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      showToast('That photo is too large', { description: 'Pick one under 8 MB.', variant: 'error' })
      return
    }
    try {
      setBusy(true)
      const dataUrl = await resizeToSquare(file)
      await savePhoto(dataUrl, 'Profile photo updated')
    } catch (error) {
      setBusy(false)
      showToast('Could not use that photo', { description: error instanceof Error ? error.message : undefined, variant: 'error' })
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-navy-700/10 bg-white p-6 text-center shadow-sm dark:border-navy-700 dark:bg-navy-800 sm:flex-row sm:text-left">
      <div className="relative shrink-0">
        <Avatar name={user.name} src={user.avatar} size="xl" className={busy ? 'opacity-60' : undefined} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label={hasPhoto ? 'Change profile photo' : 'Add profile photo'}
          className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white shadow-soft transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 dark:border-navy-800"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xl font-semibold text-navy-900 dark:text-white">{user.name}</p>
        <p className="mt-0.5 text-sm text-slate-500">
          {ROLE_LABEL[user.role]} · member since {formatDate(user.createdAt)}
        </p>
        {user.role === 'owner' && (
          <VerificationBadge kind="landlord" status={user.verification ?? 'unverified'} showUnverified className="mt-2" />
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
          <Button size="sm" variant="secondary" icon={<Camera className="h-4 w-4" />} onClick={() => fileRef.current?.click()} loading={busy}>
            {hasPhoto ? 'Change photo' : 'Upload photo'}
          </Button>
          {hasPhoto && (
            <Button
              size="sm"
              variant="ghost"
              icon={<Trash2 className="h-4 w-4" />}
              disabled={busy}
              onClick={() => savePhoto('', 'Profile photo removed')}
              className="text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
            >
              Remove
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">A clear photo of your face helps people trust who they are talking to.</p>
      </div>
    </div>
  )
}

function PersonalInfoForm({ user }: { user: User }) {
  const { updateUser } = useAuth()
  const { showToast } = useToast()
  const isOwner = user.role === 'owner'

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: toFormValues(user) })

  const phone = watch('phone')
  const whatsappSame = watch('whatsappSame')
  const bio = watch('bio')
  const network = phoneNetwork(phone)

  async function onSubmit(values: ProfileValues) {
    const formattedPhone = formatRwandaPhone(values.phone)
    try {
      const updated = await usersService.updateProfile(user, {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: formattedPhone,
        whatsapp: values.whatsappSame ? formattedPhone : formatRwandaPhone(values.whatsapp),
        city: values.city,
        bio: values.bio.trim(),
      })
      updateUser(updated)
      reset(toFormValues(updated))
      showToast('Profile saved', { description: 'Your changes are live.', variant: 'success' })
    } catch (error) {
      setError('email', { message: error instanceof Error ? error.message : 'Could not save your profile.' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
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
          hint={network ? `${network} number · used for SMS updates` : 'Used for SMS updates about viewings and repairs'}
        />
        <Select label="City" options={CITIES.map((c) => ({ value: c, label: c }))} {...register('city')} error={errors.city?.message} />
      </div>

      <div className="rounded-xl bg-navy-900/[0.03] p-4 dark:bg-white/5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy-900 dark:text-white">
          <input type="checkbox" {...register('whatsappSame')} className="h-4 w-4 rounded accent-blue-500" />
          My WhatsApp number is the same as my phone number
        </label>
        {!whatsappSame && (
          <Input
            label="WhatsApp number"
            type="tel"
            inputMode="tel"
            placeholder="072 812 3456"
            containerClassName="mt-4 sm:max-w-xs"
            {...register('whatsapp')}
            error={errors.whatsapp?.message}
          />
        )}
      </div>

      {isOwner && (
        <Textarea
          label="About you"
          rows={4}
          maxLength={BIO_MAX}
          placeholder="e.g. I manage three family homes in Kicukiro and live nearby, so repairs are handled quickly."
          {...register('bio')}
          error={errors.bio?.message}
          hint={`Shown to tenants on your listings · ${BIO_MAX - (bio?.length ?? 0)} characters left`}
        />
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-navy-700/10 pt-5 dark:border-navy-700 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="ghost" disabled={!isDirty || isSubmitting} onClick={() => reset(toFormValues(user))}>
          Discard changes
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty} icon={<Check className="h-4 w-4" />}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

function PasswordForm() {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { current: '', next: '', confirm: '' } })

  async function onSubmit() {
    // There is no real authentication behind this demo yet, so nothing is stored.
    await new Promise((resolve) => setTimeout(resolve, 500))
    reset()
    showToast('Password updated', { description: 'Use your new password next time you log in.', variant: 'success' })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        containerClassName="sm:max-w-sm"
        {...register('current')}
        error={errors.current?.message}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          {...register('next')}
          error={errors.next?.message}
          hint="At least 8 characters, with a letter and a number"
        />
        <Input label="Confirm new password" type="password" autoComplete="new-password" {...register('confirm')} error={errors.confirm?.message} />
      </div>
      <div className="flex justify-end border-t border-navy-700/10 pt-5 dark:border-navy-700">
        <Button type="submit" variant="secondary" loading={isSubmitting} className="w-full sm:w-auto">
          Update password
        </Button>
      </div>
    </form>
  )
}

/** Everything a signed-in user can change about their own account, shared by every role. */
export function ProfileSettings() {
  const { user } = useAuth()
  const logout = useLogout()

  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PhotoCard user={user} />

      <Section icon={UserRound} title="Personal information" description="How landlords, tenants and our team reach you.">
        <PersonalInfoForm key={user.id} user={user} />
      </Section>

      {user.role === 'owner' && (
        <Section icon={ShieldCheck} title="Verification" description="Your identity and ownership checks.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <VerificationBadge kind="landlord" status={user.verification ?? 'unverified'} showUnverified className="self-start sm:self-auto" />
            <Link to="/owner/verification">
              <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                Manage verification
              </Button>
            </Link>
          </div>
        </Section>
      )}

      <Section icon={Palette} title="Preferences" description="Appearance, language and data use on this device.">
        <PreferencesPanel className="max-w-md" />
      </Section>

      <Section icon={KeyRound} title="Password" description="Choose a strong password you do not use elsewhere.">
        <PasswordForm />
      </Section>

      <section className="flex flex-col gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">Log out</h2>
          <p className="text-sm text-slate-500">Sign out of NyumbaLink on this device.</p>
        </div>
        <Button variant="danger" icon={<LogOut className="h-4 w-4" />} onClick={logout} className="w-full sm:w-auto">
          Log out
        </Button>
      </section>
    </div>
  )
}
