import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useToast } from '../../hooks/useToast'
import { withDelay } from '../../services/delay'
import { cn } from '../../utils/cn'

const settingsSchema = z.object({
  platformName: z.string().min(2, 'Enter a platform name'),
  supportEmail: z.string().email('Enter a valid email address'),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-navy-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-blue-500' : 'bg-navy-900/15 dark:bg-white/15')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  )
}

export function AdminSettingsPage() {
  const { showToast } = useToast()
  const [autoApprove, setAutoApprove] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [criticalOnly, setCriticalOnly] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { platformName: 'NyumbaLink', supportEmail: 'hello@nyumbalink.rw' },
  })

  async function onSubmit() {
    await withDelay(() => undefined)
    showToast('Settings saved', { variant: 'success' })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <h2 className="text-base font-semibold text-navy-900 dark:text-white">Platform details</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <Input label="Platform name" {...register('platformName')} error={errors.platformName?.message} />
          <Input label="Support email" type="email" {...register('supportEmail')} error={errors.supportEmail?.message} />
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-navy-900 dark:text-white">Listings</h2>
        <div className="mt-2 divide-y divide-navy-700/10 dark:divide-navy-700">
          <ToggleRow
            label="Auto-approve new listings"
            description="Skip manual review and publish new listings immediately."
            checked={autoApprove}
            onChange={setAutoApprove}
          />
          <ToggleRow
            label="Maintenance mode"
            description="Show a maintenance banner to guests and pause new sign-ups."
            checked={maintenanceMode}
            onChange={setMaintenanceMode}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-navy-900 dark:text-white">Notifications</h2>
        <div className="mt-2">
          <ToggleRow
            label="Critical notifications only"
            description="Send administrators only account-security and platform-outage alerts."
            checked={criticalOnly}
            onChange={setCriticalOnly}
          />
        </div>
      </Card>
    </div>
  )
}
