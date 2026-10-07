import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, FileText, X } from 'lucide-react'
import { APPLICATION_VARIANT } from '../../components/rentals/status'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { rentalApplicationsService } from '../../services/rentalsService'
import { formatDate, formatRwf } from '../../utils/format'

export function OwnerApplicationsPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(
    () => rentalApplicationsService.list({ role: 'owner', userId: user!.id }),
    [user?.id],
  )
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'submitted' | 'all'>('submitted')
  const [busyId, setBusyId] = useState<string | null>(null)

  const applications = data ?? []
  const pending = applications.filter((a) => a.status === 'submitted')
  const filtered = tab === 'submitted' ? pending : applications

  async function approve(id: string) {
    setBusyId(id)
    const agreement = await rentalApplicationsService.approve(id)
    showToast('Application approved', { description: 'Review and sign the agreement to send it to the tenant.', variant: 'success' })
    // No setBusyId(null) on the success path — navigating away unmounts this page (see OwnerCard.handleChat).
    if (agreement) navigate(`/agreements/${agreement.id}`)
    else {
      setBusyId(null)
      reload()
    }
  }

  async function reject(id: string) {
    setBusyId(id)
    await rentalApplicationsService.reject(id)
    setBusyId(null)
    showToast('Application declined', { variant: 'success' })
    reload()
  }

  return (
    <div className="space-y-6">
      <Tabs
        items={[
          { value: 'submitted', label: 'To review', count: pending.length },
          { value: 'all', label: 'All', count: applications.length },
        ]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No applications" description="Rental applications from tenants appear here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((application) => (
            <Card key={application.id} className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar name={application.tenant?.name ?? 'Tenant'} src={application.tenant?.avatar} />
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white">{application.tenant?.name ?? 'Removed account'}</p>
                    <p className="text-sm text-slate-500">{application.tenant?.phone}</p>
                  </div>
                </div>
                <Badge variant={APPLICATION_VARIANT[application.status]} className="capitalize">
                  {application.status}
                </Badge>
              </div>

              <p className="text-sm font-medium text-navy-900 dark:text-white">{application.property?.title ?? 'Listing removed'}</p>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Move-in</dt>
                  <dd className="text-navy-900 dark:text-white">{formatDate(application.moveInDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Lease</dt>
                  <dd className="text-navy-900 dark:text-white">{application.leaseMonths} months</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">People</dt>
                  <dd className="text-navy-900 dark:text-white">{application.occupants}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Monthly income</dt>
                  <dd className="text-navy-900 dark:text-white">
                    {application.monthlyIncome ? formatRwf(application.monthlyIncome) : 'Not shared'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500">Occupation</dt>
                  <dd className="text-navy-900 dark:text-white">{application.occupation}</dd>
                </div>
              </dl>

              <p className="text-sm italic leading-relaxed text-slate-500">“{application.message}”</p>

              {application.status === 'submitted' && (
                <div className="flex flex-col gap-2 min-[420px]:flex-row">
                  <Button
                    size="sm"
                    className="flex-1"
                    icon={<Check className="h-4 w-4" />}
                    loading={busyId === application.id}
                    onClick={() => approve(application.id)}
                  >
                    Approve and draft agreement
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<X className="h-4 w-4" />}
                    disabled={busyId === application.id}
                    onClick={() => reject(application.id)}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
