import { useState } from 'react'
import { CalendarDays, Check, X } from 'lucide-react'
import { formatDateTime, VIEWING_VARIANT } from '../../components/rentals/status'
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
import { viewingsService } from '../../services/rentalsService'
import type { ViewingStatus } from '../../types'

type TabKey = 'requested' | 'confirmed' | 'past'

const PAST: ViewingStatus[] = ['completed', 'declined', 'cancelled']

export function OwnerViewingsPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(() => viewingsService.list({ role: 'owner', userId: user!.id }), [user?.id])
  const { showToast } = useToast()
  const [tab, setTab] = useState<TabKey>('requested')
  const [busyId, setBusyId] = useState<string | null>(null)

  const viewings = data ?? []
  const inTab = (key: TabKey) => viewings.filter((v) => (key === 'past' ? PAST.includes(v.status) : v.status === key))
  const filtered = inTab(tab)

  async function setStatus(id: string, status: ViewingStatus, message: string) {
    setBusyId(id)
    await viewingsService.setStatus(id, status, 'owner')
    setBusyId(null)
    showToast(message, { description: 'The tenant has been notified.', variant: 'success' })
    reload()
  }

  return (
    <div className="space-y-6">
      <Tabs
        items={[
          { value: 'requested', label: 'Requests', count: inTab('requested').length },
          { value: 'confirmed', label: 'Confirmed', count: inTab('confirmed').length },
          { value: 'past', label: 'Past', count: inTab('past').length },
        ]}
        value={tab}
        onChange={(v) => setTab(v as TabKey)}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No viewings here" description="Viewing requests from tenants appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((viewing) => (
            <Card key={viewing.id} className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white">{formatDateTime(viewing.scheduledAt)}</p>
                  <p className="text-sm text-slate-500">{viewing.property?.title ?? 'Listing removed'}</p>
                </div>
                <Badge variant={VIEWING_VARIANT[viewing.status]} className="capitalize">
                  {viewing.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2.5">
                <Avatar name={viewing.tenant?.name ?? 'Tenant'} src={viewing.tenant?.avatar} size="sm" />
                <div className="text-sm">
                  <p className="font-medium text-navy-900 dark:text-white">{viewing.tenant?.name ?? 'Removed account'}</p>
                  <p className="text-slate-500">{viewing.tenant?.phone}</p>
                </div>
              </div>
              {viewing.note && <p className="text-sm italic text-slate-500">“{viewing.note}”</p>}

              {viewing.status === 'requested' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    icon={<Check className="h-4 w-4" />}
                    loading={busyId === viewing.id}
                    onClick={() => setStatus(viewing.id, 'confirmed', 'Viewing confirmed')}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    icon={<X className="h-4 w-4" />}
                    disabled={busyId === viewing.id}
                    onClick={() => setStatus(viewing.id, 'declined', 'Viewing declined')}
                  >
                    Decline
                  </Button>
                </div>
              )}
              {viewing.status === 'confirmed' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    loading={busyId === viewing.id}
                    onClick={() => setStatus(viewing.id, 'completed', 'Marked as completed')}
                  >
                    Mark as completed
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === viewing.id}
                    onClick={() => setStatus(viewing.id, 'cancelled', 'Viewing cancelled')}
                  >
                    Cancel
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
