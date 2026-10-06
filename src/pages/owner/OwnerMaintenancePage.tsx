import { useState } from 'react'
import { Wrench } from 'lucide-react'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_STATUS, URGENCY_VARIANT } from '../../components/rentals/status'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { Textarea } from '../../components/ui/Textarea'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { maintenanceService } from '../../services/rentalsService'
import type { WithParties } from '../../services/rentalsService'
import type { MaintenanceRequest, MaintenanceStatus } from '../../types'
import { formatRelativeTime } from '../../utils/format'

const STATUS_OPTIONS: { value: MaintenanceStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
]

const URGENCY_ORDER = { urgent: 0, medium: 1, low: 2 }

export function OwnerMaintenancePage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(() => maintenanceService.list({ role: 'owner', userId: user!.id }), [user?.id])
  const { showToast } = useToast()
  const [tab, setTab] = useState<'active' | 'resolved'>('active')
  const [target, setTarget] = useState<WithParties<MaintenanceRequest> | null>(null)
  const [status, setStatus] = useState<MaintenanceStatus>('in_progress')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const requests = data ?? []
  const active = requests.filter((r) => r.status !== 'resolved').sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency])
  const resolved = requests.filter((r) => r.status === 'resolved')
  const filtered = tab === 'active' ? active : resolved

  function openUpdate(request: WithParties<MaintenanceRequest>) {
    setTarget(request)
    setStatus(request.status === 'open' ? 'in_progress' : request.status)
    setNote(request.ownerNote ?? '')
  }

  async function handleSave() {
    if (!target) return
    setSaving(true)
    await maintenanceService.update(target.id, status, note.trim() || undefined)
    setSaving(false)
    setTarget(null)
    showToast('Repair updated', { description: 'The tenant has been notified.', variant: 'success' })
    reload()
  }

  return (
    <div className="space-y-6">
      <Tabs
        items={[
          { value: 'active', label: 'Open', count: active.length },
          { value: 'resolved', label: 'Resolved', count: resolved.length },
        ]}
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Wrench} title="Nothing here" description="Repairs your tenants report appear here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((request) => (
            <Card key={request.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white">{request.title}</p>
                  <p className="text-sm text-slate-500">
                    {request.property?.title ?? 'Listing removed'} · {request.tenant?.name ?? 'Tenant'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Badge variant={URGENCY_VARIANT[request.urgency]} className="capitalize">
                    {request.urgency}
                  </Badge>
                  <Badge variant={MAINTENANCE_STATUS[request.status].variant}>{MAINTENANCE_STATUS[request.status].label}</Badge>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">{request.description}</p>
              {request.ownerNote && <p className="text-sm text-navy-900 dark:text-white">Your note: {request.ownerNote}</p>}
              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-slate-500">
                  {MAINTENANCE_CATEGORIES.find((c) => c.value === request.category)?.label} · reported{' '}
                  {formatRelativeTime(request.createdAt)}
                </p>
                <Button size="sm" variant="secondary" onClick={() => openUpdate(request)}>
                  Update
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Update repair"
        description={target ? `"${target.title}"` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save and notify tenant
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as MaintenanceStatus)} />
          <Textarea
            label="Note for the tenant (optional)"
            rows={3}
            placeholder="e.g. The plumber is coming on Thursday morning."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
