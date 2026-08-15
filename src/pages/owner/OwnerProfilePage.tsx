import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { usersService } from '../../services/usersService'

const profileSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  city: z.string().min(2, 'Enter your city'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function OwnerProfilePage() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      city: user?.city ?? '',
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return
    const updated = await usersService.update(user.id, {
      name: values.name,
      email: values.email,
      phone: values.phone,
      city: values.city,
    })
    if (updated) updateUser(updated)
    showToast('Profile updated', { variant: 'success' })
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={user.name} src={user.avatar} size="lg" />
          <div>
            <p className="font-semibold text-navy-900 dark:text-white">{user.name}</p>
            <p className="text-sm capitalize text-slate-500">{user.role} account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Full name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
          <Input label="City" {...register('city')} error={errors.city?.message} />
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  )
}
