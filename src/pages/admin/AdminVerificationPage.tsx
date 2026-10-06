import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Check, CheckCircle2, ExternalLink, FileText, ShieldCheck, TriangleAlert, X, XCircle } from 'lucide-react'
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
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { verificationService } from '../../services/verificationService'
import type { VerificationCheck, VerificationReviewItem } from '../../services/verificationService'
import type { VerificationRequestStatus } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'
import { DOC_TYPE_LABELS } from '../../utils/verification'

const STATUS_VARIANT = { pending: 'pending', approved: 'success', rejected: 'danger' } as const

const CHECK_STYLE = {
  pass: { icon: CheckCircle2, className: 'text-emerald-500' },
  warn: { icon: TriangleAlert, className: 'text-amber-500' },
  fail: { icon: XCircle, className: 'text-rose-500' },
} as const

function CheckList({ checks }: { checks: VerificationCheck[] }) {
  return (
    <ul className="space-y-2.5">
      {checks.map((check) => {
        const { icon: Icon, className } = CHECK_STYLE[check.result]
        return (
          <li key={check.label} className="flex items-start gap-2.5">
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', className)} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-navy-900 dark:text-white">{check.label}</p>
              <p className="text-xs text-slate-500">{check.detail}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-navy-900 dark:text-white">{value}</dd>
    </div>
  )
}

interface RequestCardProps {
  item: VerificationReviewItem
  busy: boolean
  onApprove: () => void
  onReject: () => void
}

function RequestCard({ item, busy, onApprove, onReject }: RequestCardProps) {
  const { request, owner, property, checks } = item
  const isOwner = request.subject === 'owner'
  const SubjectIcon = isOwner ? ShieldCheck : BadgeCheck

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              isOwner ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            )}
          >
            <SubjectIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-navy-900 dark:text-white">{isOwner ? 'Landlord identity' : 'Property ownership'}</p>
            <p className="text-xs text-slate-500">Submitted {formatDate(request.submittedAt)}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[request.status]} className="capitalize">
          {request.status}
        </Badge>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-navy-900/[0.03] p-3 dark:bg-white/5">
        <Avatar name={owner?.name ?? 'Unknown'} src={owner?.avatar} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-900 dark:text-white">{owner?.name ?? 'Removed account'}</p>
          <p className="truncate text-xs text-slate-500">
            {owner?.email} · {owner?.phone ?? 'no phone'}
          </p>
        </div>
        {!isOwner && owner?.verification !== 'verified' && <Badge variant="pending">ID not verified</Badge>}
      </div>

      {property && (
        <div className="flex items-center gap-3">
          <img src={property.images[0]} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-900 dark:text-white">{property.title}</p>
            <p className="text-xs text-slate-500">{property.address}</p>
          </div>
          <Link
            to={`/listings/${property.id}`}
            target="_blank"
            className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-400"
          >
            Listing
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-4">
        {isOwner ? (
          <Field label="ID / passport number" value={request.idNumber ?? '—'} />
        ) : (
          <>
            <Field label="UPI (parcel)" value={request.upi ?? '—'} />
            <Field label="Submitted as" value={request.relationship === 'agent' ? 'Manager for the title holder' : 'Title holder'} />
          </>
        )}
      </dl>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
        <ul className="space-y-1.5">
          {request.documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-navy-900 dark:text-white">
                <FileText className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span className="truncate">
                  {DOC_TYPE_LABELS[doc.type]} <span className="text-slate-500">— {doc.fileName}</span>
                </span>
              </span>
              {doc.url ? (
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="shrink-0 font-medium text-blue-500 hover:text-blue-400">
                  Open
                </a>
              ) : (
                <span className="shrink-0 text-xs text-slate-500">On file</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {request.note && (
        <p className="rounded-xl border border-navy-700/10 p-3 text-sm italic text-slate-500 dark:border-navy-700">“{request.note}”</p>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Automatic checks</p>
        <CheckList checks={checks} />
      </div>

      {request.status === 'pending' ? (
        <div className="flex gap-2 border-t border-navy-700/10 pt-4 dark:border-navy-700">
          <Button size="sm" className="flex-1" icon={<Check className="h-4 w-4" />} loading={busy} onClick={onApprove}>
            Approve and grant badge
          </Button>
          <Button size="sm" variant="secondary" className="flex-1" icon={<X className="h-4 w-4" />} disabled={busy} onClick={onReject}>
            Reject
          </Button>
        </div>
      ) : (
        <p className="border-t border-navy-700/10 pt-4 text-xs text-slate-500 dark:border-navy-700">
          {request.status === 'approved' ? 'Approved' : 'Rejected'}
          {request.reviewedAt ? ` on ${formatDate(request.reviewedAt)}` : ''}
          {request.reviewerNote ? ` — ${request.reviewerNote}` : ''}
        </p>
      )}
    </Card>
  )
}

export function AdminVerificationPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(() => verificationService.listForReview(), [])
  const { showToast } = useToast()

  const [tab, setTab] = useState<VerificationRequestStatus>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<VerificationReviewItem | null>(null)
  const [rejectTarget, setRejectTarget] = useState<VerificationReviewItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState<string | null>(null)

  const items = useMemo(() => data ?? [], [data])
  const count = (status: VerificationRequestStatus) => items.filter((i) => i.request.status === status).length
  const filtered = items.filter((i) => i.request.status === tab)

  async function decide(item: VerificationReviewItem, decision: 'approved' | 'rejected', note?: string) {
    setBusyId(item.request.id)
    await verificationService.review(item.request.id, decision, user!.id, note)
    showToast(decision === 'approved' ? 'Badge granted' : 'Request rejected', {
      description: 'The landlord has been notified.',
      variant: 'success',
    })
    setBusyId(null)
    setApproveTarget(null)
    setRejectTarget(null)
    reload()
  }

  function startApprove(item: VerificationReviewItem) {
    // A clean request is approved in one click; anything the pre-checks flagged needs a deliberate second step.
    if (item.checks.some((c) => c.result !== 'pass')) setApproveTarget(item)
    else decide(item, 'approved')
  }

  function submitReject() {
    if (rejectReason.trim().length < 10) {
      setRejectError('Explain what the landlord needs to fix (10+ characters).')
      return
    }
    if (rejectTarget) decide(rejectTarget, 'rejected', rejectReason.trim())
  }

  const flagged = approveTarget?.checks.filter((c) => c.result !== 'pass') ?? []

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-slate-500">
        Approving a request is what puts a verified badge on a landlord or listing. The automatic checks only catch format and
        duplicate problems — open each document and confirm the names match before approving.
      </p>

      <Tabs
        items={[
          { value: 'pending', label: 'Pending', count: count('pending') },
          { value: 'approved', label: 'Approved', count: count('approved') },
          { value: 'rejected', label: 'Rejected', count: count('rejected') },
        ]}
        value={tab}
        onChange={(v) => setTab(v as VerificationRequestStatus)}
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-96 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={`No ${tab} requests`} description="Verification requests from landlords appear here." />
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          {filtered.map((item) => (
            <RequestCard
              key={item.request.id}
              item={item}
              busy={busyId === item.request.id}
              onApprove={() => startApprove(item)}
              onReject={() => {
                setRejectReason('')
                setRejectError(null)
                setRejectTarget(item)
              }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => approveTarget && decide(approveTarget, 'approved')}
        title="Approve despite open checks?"
        description={`Not passed: ${flagged.map((c) => c.label).join('; ')}. Only approve if you resolved these by other means.`}
        confirmLabel="Approve anyway"
        loading={busyId === approveTarget?.request.id}
      />

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject this request"
        description="The landlord sees this note and can submit again."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={submitReject} loading={busyId === rejectTarget?.request.id}>
              Reject request
            </Button>
          </>
        }
      >
        <Textarea
          label="Reason"
          rows={4}
          placeholder="e.g. The name on the title does not match the account holder. Attach a notarised authorisation letter."
          value={rejectReason}
          onChange={(e) => {
            setRejectReason(e.target.value)
            setRejectError(null)
          }}
          error={rejectError ?? undefined}
        />
      </Modal>
    </div>
  )
}
