import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bell, CalendarDays, Check, FileSignature, FileText, Wrench } from 'lucide-react'
import { MaintenanceRequestModal } from '../../components/rentals/MaintenanceRequestModal'
import {
  AGREEMENT_STATUS,
  APPLICATION_VARIANT,
  formatDateTime,
  MAINTENANCE_STATUS,
  URGENCY_VARIANT,
  VIEWING_VARIANT,
} from '../../components/rentals/status'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { notificationsService } from '../../services/notificationsService'
import {
  agreementsService,
  maintenanceService,
  rentalApplicationsService,
  viewingsService,
} from '../../services/rentalsService'
import type { Property } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate, formatRelativeTime, formatRwf } from '../../utils/format'
import { STORAGE_KEYS, storage } from '../../utils/storage'

type TabKey = 'viewings' | 'applications' | 'agreements' | 'maintenance' | 'notifications'
const TAB_KEYS: TabKey[] = ['viewings', 'applications', 'agreements', 'maintenance', 'notifications']

function Row({ property, children, aside }: { property: Property | undefined; children: ReactNode; aside?: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-2xl border border-navy-700/10 bg-white p-4 dark:border-navy-700 dark:bg-navy-800">
      {property && <img src={property.images[0]} alt="" loading="lazy" className="h-16 w-24 shrink-0 rounded-xl object-cover" />}
      <div className="min-w-[12rem] flex-1">
        {property ? (
          <Link to={`/listings/${property.id}`} className="font-medium text-navy-900 hover:text-blue-500 dark:text-white">
            {property.title}
          </Link>
        ) : (
          <p className="font-medium text-slate-500">Listing removed</p>
        )}
        {children}
      </div>
      {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
    </li>
  )
}

const CHANNELS = [
  { key: 'sms', label: 'SMS', description: 'Viewing confirmations, agreement and repair updates by text message.' },
  { key: 'push', label: 'Push notifications', description: 'Alerts on this phone, even when the app is closed.' },
  { key: 'email', label: 'Email', description: 'A copy of signed agreements and a weekly summary.' },
] as const

type ChannelPrefs = Record<(typeof CHANNELS)[number]['key'], boolean>

function NotificationPreferences() {
  const [prefs, setPrefs] = useState<ChannelPrefs>(
    () => storage.get<ChannelPrefs>(STORAGE_KEYS.notificationPrefs) ?? { sms: true, push: true, email: false },
  )

  function toggle(key: keyof ChannelPrefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    storage.set(STORAGE_KEYS.notificationPrefs, next)
  }

  return (
    <div className="rounded-2xl border border-navy-700/10 bg-white p-5 dark:border-navy-700 dark:bg-navy-800">
      <h2 className="text-base font-semibold text-navy-900 dark:text-white">How we reach you</h2>
      <ul className="mt-3 divide-y divide-navy-700/10 dark:divide-navy-700">
        {CHANNELS.map((channel) => (
          <li key={channel.key}>
            <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
              <span>
                <span className="block text-sm font-medium text-navy-900 dark:text-white">{channel.label}</span>
                <span className="block text-xs text-slate-500">{channel.description}</span>
              </span>
              <input
                type="checkbox"
                checked={prefs[channel.key]}
                onChange={() => toggle(channel.key)}
                className="h-5 w-5 shrink-0 rounded accent-blue-500"
              />
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-slate-500">
        Preview build: your choices are saved, but only the in-app inbox below is delivered until the SMS and push gateways are
        connected.
      </p>
    </div>
  )
}

export function AccountPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useToast()
  const tenantId = user!.id
  const party = { role: 'tenant' as const, userId: tenantId }
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab') as TabKey | null
  const tab: TabKey = requestedTab && TAB_KEYS.includes(requestedTab) ? requestedTab : 'viewings'

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        viewingsService.list(party),
        rentalApplicationsService.list(party),
        agreementsService.list(party),
        maintenanceService.list(party),
        notificationsService.listForUser(user!),
      ]),
    [tenantId],
  )
  const [repairOpen, setRepairOpen] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Opening the inbox is what marks it read; the list keeps showing the unread dots until the next load.
  useEffect(() => {
    if (tab === 'notifications' && user) notificationsService.markAllRead(user)
  }, [tab, user])

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState onRetry={reload} />
      </div>
    )
  }

  const [viewings, applications, agreements, maintenance, notifications] = data ?? [[], [], [], [], []]
  const activeAgreements = agreements.filter((a) => a.status === 'active')
  const toSign = agreements.filter((a) => a.status === 'awaiting_tenant').length
  const unread = notifications.filter((n) => !n.read).length

  const journey = [
    { label: t('journey.visit'), done: viewings.length > 0 },
    { label: t('journey.apply'), done: applications.length > 0 },
    { label: t('journey.sign'), done: agreements.some((a) => a.tenantSignature) },
    { label: t('journey.manage'), done: activeAgreements.length > 0 },
  ]

  async function run(id: string, action: () => Promise<unknown>, message: string) {
    setBusyId(id)
    await action()
    setBusyId(null)
    showToast(message, { variant: 'success' })
    reload()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">{t('nav.myRentals')}</h1>
      <p className="mt-2 text-slate-500">Your viewings, applications, agreements and repairs in one place.</p>

      <ol className="mt-6 grid grid-cols-4 gap-2">
        {journey.map((step, index) => (
          <li
            key={step.label}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium sm:flex-row sm:justify-center sm:text-sm',
              step.done
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-navy-700/10 text-slate-500 dark:border-navy-700',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
                step.done ? 'bg-emerald-600 text-white' : 'bg-navy-900/5 dark:bg-white/10',
              )}
            >
              {step.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
            </span>
            {step.label}
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <Tabs
          items={[
            { value: 'viewings', label: 'Viewings', count: viewings.length },
            { value: 'applications', label: 'Applications', count: applications.length },
            { value: 'agreements', label: 'Agreements', count: agreements.length },
            { value: 'maintenance', label: 'Repairs', count: maintenance.length },
            { value: 'notifications', label: t('nav.notifications'), count: unread || undefined },
          ]}
          value={tab}
          onChange={(value) => setSearchParams({ tab: value }, { replace: true })}
        />
      </div>

      <div className="mt-6">
        {loading && !data ? (
          <Skeleton className="h-64 w-full" />
        ) : tab === 'viewings' ? (
          viewings.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No viewings yet"
              description='Open a listing and tap "Schedule a viewing" to arrange a visit with the landlord.'
              action={
                <Link to="/browse">
                  <Button>Browse listings</Button>
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {viewings.map((viewing) => (
                <Row
                  key={viewing.id}
                  property={viewing.property}
                  aside={
                    <>
                      <Badge variant={VIEWING_VARIANT[viewing.status]} className="capitalize">
                        {viewing.status}
                      </Badge>
                      {(viewing.status === 'requested' || viewing.status === 'confirmed') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === viewing.id}
                          onClick={() => run(viewing.id, () => viewingsService.setStatus(viewing.id, 'cancelled', 'tenant'), 'Viewing cancelled')}
                        >
                          Cancel
                        </Button>
                      )}
                    </>
                  }
                >
                  <p className="mt-0.5 text-sm text-slate-500">
                    {formatDateTime(viewing.scheduledAt)} · with {viewing.owner?.name ?? 'the landlord'}
                  </p>
                  {viewing.status === 'confirmed' && viewing.property && (
                    <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">Meet at: {viewing.property.address}</p>
                  )}
                </Row>
              ))}
            </ul>
          )
        ) : tab === 'applications' ? (
          applications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description='Found the right home? Tap "Apply to rent" on its listing — no payment needed.'
            />
          ) : (
            <ul className="space-y-3">
              {applications.map((application) => (
                <Row
                  key={application.id}
                  property={application.property}
                  aside={
                    <>
                      <Badge variant={APPLICATION_VARIANT[application.status]} className="capitalize">
                        {application.status}
                      </Badge>
                      {application.status === 'submitted' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === application.id}
                          onClick={() => run(application.id, () => rentalApplicationsService.withdraw(application.id), 'Application withdrawn')}
                        >
                          Withdraw
                        </Button>
                      )}
                    </>
                  }
                >
                  <p className="mt-0.5 text-sm text-slate-500">
                    Move in {formatDate(application.moveInDate)} · {application.leaseMonths} months · applied{' '}
                    {formatRelativeTime(application.createdAt)}
                  </p>
                </Row>
              ))}
            </ul>
          )
        ) : tab === 'agreements' ? (
          agreements.length === 0 ? (
            <EmptyState
              icon={FileSignature}
              title="No agreements yet"
              description="When a landlord approves your application, the rental agreement appears here for you to sign."
            />
          ) : (
            <ul className="space-y-3">
              {toSign > 0 && (
                <li className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                  {toSign} agreement{toSign === 1 ? ' is' : 's are'} waiting for your signature.
                </li>
              )}
              {agreements.map((agreement) => (
                <Row
                  key={agreement.id}
                  property={agreement.property}
                  aside={
                    <>
                      <Badge variant={AGREEMENT_STATUS[agreement.status].variant}>{AGREEMENT_STATUS[agreement.status].label}</Badge>
                      <Link to={`/agreements/${agreement.id}`}>
                        <Button size="sm" variant={agreement.status === 'awaiting_tenant' ? 'primary' : 'secondary'}>
                          {agreement.status === 'awaiting_tenant' ? 'Review and sign' : 'View'}
                        </Button>
                      </Link>
                    </>
                  }
                >
                  <p className="mt-0.5 text-sm text-slate-500">
                    {formatRwf(agreement.monthlyRent)}/month · {formatDate(agreement.startDate)} – {formatDate(agreement.endDate)}
                  </p>
                </Row>
              ))}
            </ul>
          )
        ) : tab === 'maintenance' ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {activeAgreements.length > 0
                  ? 'Something broken at home? Report it and track the fix here.'
                  : 'Repairs can be reported once you have an active rental agreement.'}
              </p>
              <Button
                size="sm"
                icon={<Wrench className="h-4 w-4" />}
                disabled={activeAgreements.length === 0}
                onClick={() => setRepairOpen(true)}
              >
                Report a repair
              </Button>
            </div>
            {maintenance.length === 0 ? (
              <EmptyState icon={Wrench} title="No repairs reported" />
            ) : (
              <ul className="space-y-3">
                {maintenance.map((request) => (
                  <Row
                    key={request.id}
                    property={request.property}
                    aside={
                      <>
                        <Badge variant={URGENCY_VARIANT[request.urgency]} className="capitalize">
                          {request.urgency}
                        </Badge>
                        <Badge variant={MAINTENANCE_STATUS[request.status].variant}>{MAINTENANCE_STATUS[request.status].label}</Badge>
                      </>
                    }
                  >
                    <p className="mt-0.5 text-sm font-medium text-navy-900 dark:text-white">{request.title}</p>
                    <p className="text-sm text-slate-500">{request.description}</p>
                    {request.ownerNote && (
                      <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Landlord: {request.ownerNote}</p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-500">Reported {formatRelativeTime(request.createdAt)}</p>
                  </Row>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <NotificationPreferences />
            {notifications.length === 0 ? (
              <EmptyState icon={Bell} title="No notifications yet" />
            ) : (
              <ul className="divide-y divide-navy-700/10 rounded-2xl border border-navy-700/10 bg-white dark:divide-navy-700 dark:border-navy-700 dark:bg-navy-800">
                {notifications.map((notification) => (
                  <li key={notification.id} className="flex items-start gap-3 p-4">
                    <span
                      className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', notification.read ? 'bg-transparent' : 'bg-blue-500')}
                      aria-hidden="true"
                    />
                    <div className="min-w-[12rem] flex-1">
                      <p className="text-sm font-medium text-navy-900 dark:text-white">{notification.title}</p>
                      <p className="text-sm text-slate-500">{notification.body}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{formatRelativeTime(notification.createdAt)}</p>
                    </div>
                    {notification.href && (
                      <Link to={notification.href} className="shrink-0 text-sm font-medium text-blue-500 hover:text-blue-400">
                        Open
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <MaintenanceRequestModal open={repairOpen} onClose={() => setRepairOpen(false)} agreements={activeAgreements} onCreated={reload} />
    </div>
  )
}
