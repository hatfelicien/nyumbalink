import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { applicationsService } from '../../services/applicationsService'
import { usersService } from '../../services/usersService'
import type { ApplicationStatus } from '../../types'
import { formatDate } from '../../utils/format'

const STATUS_VARIANT = { pending: 'pending', approved: 'success', rejected: 'danger' } as const

export function AdminApplicationsPage() {
  const { data, loading, error, reload } = useAsync(() => applicationsService.list(), [])
  const { showToast } = useToast()
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  const applications = data ?? []
  const filtered = useMemo(
    () => (tab === 'pending' ? applications.filter((a) => a.status === 'pending') : applications),
    [applications, tab],
  )

  async function decide(id: string, status: ApplicationStatus) {
    setBusyId(id)
    const application = applications.find((a) => a.id === id)
    await applicationsService.setStatus(id, status)

    if (status === 'approved' && application) {
      await usersService.addOwner({
        name: application.name,
        email: application.email,
        phone: application.phone,
        city: application.city,
        status: 'active',
      })
    }

    showToast(status === 'approved' ? 'Application approved' : 'Application rejected', { variant: 'success' })
    setBusyId(null)
    reload()
  }

  return (
    <div className="space-y-6">
      <Tabs
        items={[
          { value: 'pending', label: 'Pending', count: applications.filter((a) => a.status === 'pending').length },
          { value: 'all', label: 'All', count: applications.length },
        ]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No applications" description="Owner applications will appear here for review." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((application) => (
            <Card key={application.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white">{application.name}</p>
                  <p className="text-sm text-slate-500">{application.email}</p>
                </div>
                <Badge variant={STATUS_VARIANT[application.status]} className="capitalize">
                  {application.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{application.message}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{application.phone} · {application.city}</span>
                <span>{formatDate(application.createdAt)}</span>
              </div>

              {application.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    icon={<Check className="h-4 w-4" />}
                    loading={busyId === application.id}
                    onClick={() => decide(application.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    icon={<X className="h-4 w-4" />}
                    disabled={busyId === application.id}
                    onClick={() => decide(application.id, 'rejected')}
                  >
                    Reject
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
