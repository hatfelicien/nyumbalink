import { useMemo, useState } from 'react'
import { Building2, Check, ClipboardList, IdCard, MapPin, Phone, UserCheck, X } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { Textarea } from '../../components/ui/Textarea'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { applicationsService } from '../../services/applicationsService'
import type { ApplicationStatus, OwnerApplication } from '../../types'
import { formatDate, formatRelativeTime } from '../../utils/format'
import { validateNationalId } from '../../utils/verification'

const STATUS_VARIANT = { pending: 'pending', approved: 'success', rejected: 'danger' } as const
const STATUS_LABEL = { pending: 'Awaiting review', approved: 'Approved', rejected: 'Rejected' } as const
const PROPERTY_COUNT_LABEL: Record<string, string> = { '1': '1 property', '2-5': '2–5 properties', '6-10': '6–10 properties', '10+': 'More than 10' }

type TabKey = ApplicationStatus | 'all'

function Detail({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) {
  return (
    <li className="flex min-w-0 items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <span className="min-w-0 truncate">{children}</span>
    </li>
  )
}

function ApplicationCard({
  application,
  busy,
  onApprove,
  onReject,
}: {
  application: OwnerApplication
  busy: boolean
  onApprove: () => void
  onReject: () => void
}) {
  const idProblem = application.nationalId ? validateNationalId(application.nationalId) : null

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={application.name} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy-900 dark:text-white">{application.name}</p>
            <p className="truncate text-sm text-slate-500">{application.email}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[application.status]} className="shrink-0">
          {STATUS_LABEL[application.status]}
        </Badge>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        <Detail icon={Phone}>{application.phone}</Detail>
        <Detail icon={MapPin}>{application.district ? `${application.district} · ${application.city}` : application.city}</Detail>
        {application.propertyCount && <Detail icon={Building2}>{PROPERTY_COUNT_LABEL[application.propertyCount] ?? application.propertyCount}</Detail>}
        {application.nationalId && (
          <Detail icon={IdCard}>
            {application.nationalId}
            {idProblem && <span className="ml-1.5 text-rose-500">({idProblem.toLowerCase()})</span>}
          </Detail>
        )}
      </ul>

      <p className="rounded-xl bg-navy-900/[0.03] p-3 text-sm leading-relaxed text-slate-600 dark:bg-white/5 dark:text-slate-300">
        “{application.message}”
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Applied {formatRelativeTime(application.createdAt)}</span>
        {application.userId ? (
          <span className="flex items-center gap-1 font-medium text-blue-500 dark:text-blue-400">
            <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Account created, waiting to be switched on
          </span>
        ) : (
          <span>Approving creates the account</span>
        )}
      </div>

      {application.status === 'pending' ? (
        <div className="mt-auto flex flex-col gap-2 border-t border-navy-700/10 pt-4 dark:border-navy-700 min-[420px]:flex-row">
          <Button size="sm" className="flex-1" icon={<Check className="h-4 w-4" />} loading={busy} onClick={onApprove}>
            Approve account
          </Button>
          <Button size="sm" variant="secondary" className="flex-1" icon={<X className="h-4 w-4" />} disabled={busy} onClick={onReject}>
            Reject
          </Button>
        </div>
      ) : (
        <p className="mt-auto border-t border-navy-700/10 pt-3 text-xs text-slate-500 dark:border-navy-700">
          {application.status === 'approved' ? 'Approved' : 'Rejected'}
          {application.reviewedAt ? ` on ${formatDate(application.reviewedAt)}` : ''}
          {application.reviewNote ? ` — ${application.reviewNote}` : ''}
        </p>
      )}
    </Card>
  )
}

export function AdminApplicationsPage() {
  const { data, loading, error, reload } = useAsync(() => applicationsService.list(), [])
  const { showToast } = useToast()
  const [tab, setTab] = useState<TabKey>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<OwnerApplication | null>(null)
  const [rejectTarget, setRejectTarget] = useState<OwnerApplication | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)

  const applications = useMemo(() => data ?? [], [data])
  const count = (status: ApplicationStatus) => applications.filter((a) => a.status === status).length
  const filtered = tab === 'all' ? applications : applications.filter((a) => a.status === tab)

  async function decide(application: OwnerApplication, decision: 'approved' | 'rejected', note?: string) {
    setBusyId(application.id)
    await applicationsService.review(application.id, decision, note)
    setBusyId(null)
    setApproveTarget(null)
    setRejectTarget(null)
    showToast(decision === 'approved' ? 'Landlord account approved' : 'Application rejected', {
      description:
        decision === 'approved'
          ? `${application.name} can now log in with the email and password they registered with.`
          : `${application.name} will see your reason when they try to log in.`,
      variant: 'success',
    })
    reload()
  }

  function submitReject() {
    if (reason.trim().length < 10) {
      setReasonError('Give the applicant a reason they can act on (10+ characters).')
      return
    }
    if (rejectTarget) decide(rejectTarget, 'rejected', reason.trim())
  }

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-slate-500">
        Landlords register here before they can log in. Approving switches their account on; rejecting keeps it locked and
        shows them your reason.
      </p>

      <Tabs
        items={[
          { value: 'pending', label: 'Awaiting review', count: count('pending') },
          { value: 'approved', label: 'Approved', count: count('approved') },
          { value: 'rejected', label: 'Rejected', count: count('rejected') },
          { value: 'all', label: 'All', count: applications.length },
        ]}
        value={tab}
        onChange={(value) => setTab(value as TabKey)}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={tab === 'pending' ? 'No applications waiting' : 'No applications here'}
          description="New landlord applications appear here for review."
        />
      ) : (
        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          {filtered.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              busy={busyId === application.id}
              onApprove={() => setApproveTarget(application)}
              onReject={() => {
                setReason('')
                setReasonError(null)
                setRejectTarget(application)
              }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => approveTarget && decide(approveTarget, 'approved')}
        title={`Approve ${approveTarget?.name ?? 'this landlord'}?`}
        description="Their landlord account is switched on immediately and they can start listing properties. Listings still need ownership verification to earn the badge."
        confirmLabel="Approve account"
        variant="primary"
        loading={busyId === approveTarget?.id}
      />

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject this application"
        description="The applicant sees this reason when they try to log in."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={submitReject} loading={busyId === rejectTarget?.id}>
              Reject application
            </Button>
          </>
        }
      >
        <Textarea
          label="Reason"
          rows={4}
          placeholder="e.g. The national ID number does not match the name given. Please apply again with the details on your ID."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setReasonError(null)
          }}
          error={reasonError ?? undefined}
        />
      </Modal>
    </div>
  )
}
