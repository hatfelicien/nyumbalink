import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EyeOff, Flag, Scale } from 'lucide-react'
import { REPORT_REASONS } from '../../components/trust/ReportListingModal'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { Textarea } from '../../components/ui/Textarea'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { propertiesService } from '../../services/propertiesService'
import { AUTO_FLAG_THRESHOLD, disputesService, reportsService } from '../../services/trustService'
import type { DisputeDetails, ReportDetails } from '../../services/trustService'
import { formatDate } from '../../utils/format'

const REPORT_VARIANT = { open: 'pending', actioned: 'success', dismissed: 'neutral' } as const
const DISPUTE_VARIANT = { open: 'pending', in_review: 'brand', resolved: 'success' } as const

function reasonLabel(report: ReportDetails) {
  return REPORT_REASONS.find((r) => r.value === report.reason)?.label ?? report.reason
}

export function AdminReportsPage() {
  const { data, loading, error, reload } = useAsync(() => Promise.all([reportsService.list(), disputesService.list()]), [])
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'disputes' ? 'disputes' : 'reports'

  const [busyId, setBusyId] = useState<string | null>(null)
  const [disputeTarget, setDisputeTarget] = useState<DisputeDetails | null>(null)
  const [resolution, setResolution] = useState('')
  const [resolutionError, setResolutionError] = useState<string | null>(null)

  const [reports, disputes] = data ?? [[], []]
  const openReports = reports.filter((r) => r.status === 'open')
  const openDisputes = disputes.filter((d) => d.status !== 'resolved')

  async function hideListing(report: ReportDetails) {
    setBusyId(report.id)
    await propertiesService.update(report.propertyId, { listingStatus: 'flagged' })
    await reportsService.resolve(report.id, 'actioned', 'Listing hidden pending landlord response.')
    setBusyId(null)
    showToast('Listing hidden', { description: 'It no longer appears in search.', variant: 'success' })
    reload()
  }

  async function dismiss(report: ReportDetails) {
    setBusyId(report.id)
    await reportsService.resolve(report.id, 'dismissed', 'Reviewed — no action needed.')
    setBusyId(null)
    showToast('Report dismissed', { variant: 'success' })
    reload()
  }

  async function startReview(dispute: DisputeDetails) {
    setBusyId(dispute.id)
    await disputesService.update(dispute.id, 'in_review')
    setBusyId(null)
    reload()
  }

  async function resolveDispute() {
    if (!disputeTarget) return
    if (resolution.trim().length < 15) return setResolutionError('Write the outcome both parties will see (15+ characters).')
    setBusyId(disputeTarget.id)
    await disputesService.update(disputeTarget.id, 'resolved', resolution.trim())
    setBusyId(null)
    setDisputeTarget(null)
    showToast('Dispute resolved', { description: 'Both parties have been notified.', variant: 'success' })
    reload()
  }

  return (
    <div className="space-y-6">
      <Tabs
        items={[
          { value: 'reports', label: 'Listing reports', count: openReports.length },
          { value: 'disputes', label: 'Disputes', count: openDisputes.length },
        ]}
        value={tab}
        onChange={(value) => setSearchParams({ tab: value }, { replace: true })}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-96 w-full" />
      ) : tab === 'reports' ? (
        reports.length === 0 ? (
          <EmptyState icon={Flag} title="No reports" description="Listings reported by tenants appear here." />
        ) : (
          <>
            <p className="text-sm text-slate-500">
              A listing is hidden automatically once {AUTO_FLAG_THRESHOLD} different people have an open report against it.
            </p>
            <div className="grid items-start gap-4 lg:grid-cols-2">
              {reports.map((report) => (
                <Card key={report.id} className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="danger">{reasonLabel(report)}</Badge>
                      {report.status === 'open' && report.openCount > 1 && <Badge variant="pending">{report.openCount} open reports</Badge>}
                    </div>
                    <Badge variant={REPORT_VARIANT[report.status]} className="capitalize">
                      {report.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    {report.property && <img src={report.property.images[0]} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0">
                      {report.property ? (
                        <Link
                          to={`/listings/${report.property.id}`}
                          target="_blank"
                          className="block truncate text-sm font-medium text-navy-900 hover:text-blue-500 dark:text-white"
                        >
                          {report.property.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-slate-500">Listing removed</p>
                      )}
                      <p className="text-xs text-slate-500">
                        Landlord: {report.owner?.name ?? 'unknown'}
                        {report.property && ` · listing is ${report.property.listingStatus}`}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm italic leading-relaxed text-slate-500">“{report.details}”</p>
                  <p className="text-xs text-slate-500">
                    Reported by {report.reporter?.name ?? 'a visitor'} on {formatDate(report.createdAt)}
                  </p>

                  {report.status === 'open' ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        className="flex-1"
                        icon={<EyeOff className="h-4 w-4" />}
                        loading={busyId === report.id}
                        onClick={() => hideListing(report)}
                      >
                        Hide listing
                      </Button>
                      <Button size="sm" variant="secondary" className="flex-1" disabled={busyId === report.id} onClick={() => dismiss(report)}>
                        Dismiss
                      </Button>
                    </div>
                  ) : (
                    report.resolution && <p className="text-xs text-slate-500">Outcome: {report.resolution}</p>
                  )}
                </Card>
              ))}
            </div>
          </>
        )
      ) : disputes.length === 0 ? (
        <EmptyState icon={Scale} title="No disputes" description="Disputes raised from rental agreements appear here." />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold capitalize text-navy-900 dark:text-white">{dispute.topic}</p>
                  <p className="text-sm text-slate-500">{dispute.property?.title ?? 'Listing removed'}</p>
                </div>
                <Badge variant={DISPUTE_VARIANT[dispute.status]} className="capitalize">
                  {dispute.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-medium text-navy-900 dark:text-white">{dispute.raisedBy?.name ?? 'Removed account'}</span> against{' '}
                <span className="font-medium text-navy-900 dark:text-white">{dispute.against?.name ?? 'Removed account'}</span> ·{' '}
                {formatDate(dispute.createdAt)}
              </p>
              <p className="text-sm italic leading-relaxed text-slate-500">“{dispute.description}”</p>
              {dispute.resolution && <p className="text-sm text-emerald-700 dark:text-emerald-300">Outcome: {dispute.resolution}</p>}

              <div className="flex flex-wrap gap-2">
                <Link to={`/agreements/${dispute.agreementId}`}>
                  <Button size="sm" variant="secondary">
                    View agreement
                  </Button>
                </Link>
                {dispute.status === 'open' && (
                  <Button size="sm" variant="secondary" loading={busyId === dispute.id} onClick={() => startReview(dispute)}>
                    Start review
                  </Button>
                )}
                {dispute.status !== 'resolved' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setResolution('')
                      setResolutionError(null)
                      setDisputeTarget(dispute)
                    }}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!disputeTarget}
        onClose={() => setDisputeTarget(null)}
        title="Resolve dispute"
        description="Both the tenant and the landlord see this outcome."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDisputeTarget(null)}>
              Cancel
            </Button>
            <Button onClick={resolveDispute} loading={busyId === disputeTarget?.id}>
              Resolve and notify
            </Button>
          </>
        }
      >
        <Textarea
          label="Outcome"
          rows={4}
          placeholder="e.g. Repainting after 12 months is normal wear. The landlord returns the full caution money within 14 days."
          value={resolution}
          onChange={(e) => {
            setResolution(e.target.value)
            setResolutionError(null)
          }}
          error={resolutionError ?? undefined}
        />
      </Modal>
    </div>
  )
}
