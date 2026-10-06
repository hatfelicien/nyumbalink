import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PenLine, Printer, Scale } from 'lucide-react'
import { AGREEMENT_STATUS } from '../../components/rentals/status'
import { VerificationBadge } from '../../components/trust/VerificationBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { agreementsService } from '../../services/rentalsService'
import { disputesService } from '../../services/trustService'
import type { DisputeTopic, Signature, User } from '../../types'
import { formatDate, formatRwf } from '../../utils/format'
import { NotFoundPage } from './NotFoundPage'

const DISPUTE_TOPICS: { value: DisputeTopic; label: string }[] = [
  { value: 'deposit', label: 'Caution money / deposit' },
  { value: 'repairs', label: 'Repairs not done' },
  { value: 'agreement', label: 'Agreement terms not respected' },
  { value: 'conduct', label: 'Conduct or harassment' },
  { value: 'other', label: 'Something else' },
]

const DISPUTE_VARIANT = { open: 'pending', in_review: 'brand', resolved: 'success' } as const

function Party({ title, person }: { title: string; person: User | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 font-medium text-navy-900 dark:text-white">{person?.name ?? 'Removed account'}</p>
      <p className="text-sm text-slate-500">{person?.phone ?? person?.email}</p>
      {person?.role === 'owner' && (
        <VerificationBadge kind="landlord" status={person.verification ?? 'unverified'} showUnverified className="mt-1.5" />
      )}
    </div>
  )
}

function SignatureBlock({ title, signature }: { title: string; signature: Signature | undefined }) {
  return (
    <div className="rounded-xl border border-navy-700/10 p-4 dark:border-navy-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {signature ? (
        <>
          <p className="mt-2 font-serif text-2xl italic text-navy-900 dark:text-white">{signature.name}</p>
          <p className="mt-1 text-xs text-slate-500">Signed electronically on {formatDate(signature.signedAt)}</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Not signed yet</p>
      )}
    </div>
  )
}

export function AgreementPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { data: agreement, loading, error, reload } = useAsync(() => agreementsService.getById(id!), [id])
  const { data: disputes, reload: reloadDisputes } = useAsync(() => disputesService.getByAgreement(id!), [id])

  const [typedName, setTypedName] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)

  const [disputeOpen, setDisputeOpen] = useState(false)
  const [topic, setTopic] = useState<DisputeTopic>('deposit')
  const [description, setDescription] = useState('')
  const [disputeError, setDisputeError] = useState<string | null>(null)
  const [submittingDispute, setSubmittingDispute] = useState(false)

  if (loading && !agreement) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-[40rem] w-full" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState onRetry={reload} />
      </div>
    )
  }

  const isTenant = user?.id === agreement?.tenantId
  const isOwner = user?.id === agreement?.ownerId
  // An agreement is private to its two parties and to admins mediating a dispute.
  if (!agreement || !user || !(isTenant || isOwner || user.role === 'admin')) return <NotFoundPage />

  const status = AGREEMENT_STATUS[agreement.status]
  const canSign = (isOwner && agreement.status === 'awaiting_owner') || (isTenant && agreement.status === 'awaiting_tenant')
  const backHref = isOwner ? '/owner/tenants' : user.role === 'admin' ? '/admin/reports?tab=disputes' : '/account?tab=agreements'

  async function handleSign() {
    if (typedName.trim().toLowerCase() !== user!.name.toLowerCase()) {
      return setSignError(`Type your full name exactly as on your account: ${user!.name}`)
    }
    if (!accepted) return setSignError('Tick the box to confirm you have read the agreement.')
    setSigning(true)
    await agreementsService.sign(agreement!.id, isOwner ? 'owner' : 'tenant', user!.name)
    setSigning(false)
    showToast('Agreement signed', {
      description: isOwner ? 'Your tenant has been asked to sign.' : 'Your tenancy is confirmed.',
      variant: 'success',
    })
    reload()
  }

  async function handleDispute() {
    if (description.trim().length < 20) return setDisputeError('Describe the problem in a few sentences (20+ characters).')
    setSubmittingDispute(true)
    await disputesService.create({
      agreementId: agreement!.id,
      propertyId: agreement!.propertyId,
      raisedById: user!.id,
      againstId: isTenant ? agreement!.ownerId : agreement!.tenantId,
      topic,
      description: description.trim(),
    })
    setSubmittingDispute(false)
    setDisputeOpen(false)
    setDescription('')
    showToast('Dispute opened', { description: 'A NyumbaLink admin will contact both of you.', variant: 'success' })
    reloadDisputes()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={backHref} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>
        <Button variant="secondary" size="sm" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
          Print or save as PDF
        </Button>
      </div>

      <article className="mt-5 rounded-2xl border border-navy-700/10 bg-white p-6 shadow-soft dark:border-navy-700 dark:bg-navy-800 sm:p-10 print:border-0 print:p-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-navy-900 dark:text-white">Residential rental agreement</h1>
            <p className="mt-1 text-sm text-slate-500">
              Amasezerano y’ubukode · Contrat de bail — reference {agreement.id.toUpperCase()}
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Party title="Landlord" person={agreement.owner} />
          <Party title="Tenant" person={agreement.tenant} />
        </div>

        <div className="mt-8 rounded-xl bg-navy-900/[0.03] p-4 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Property</p>
          <p className="mt-1 font-medium text-navy-900 dark:text-white">{agreement.property?.title ?? 'Listing removed'}</p>
          <p className="text-sm text-slate-500">{agreement.property?.address}</p>
          {agreement.property?.upi && <p className="mt-0.5 text-sm text-slate-500">Land title UPI {agreement.property.upi}</p>}
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          {[
            ['Monthly rent', formatRwf(agreement.monthlyRent)],
            ['Caution money', formatRwf(agreement.deposit)],
            ['Notice period', `${agreement.noticeDays} days`],
            ['Start date', formatDate(agreement.startDate)],
            ['End date', formatDate(agreement.endDate)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-0.5 font-semibold text-navy-900 dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-10 text-base font-semibold text-navy-900 dark:text-white">Terms</h2>
        <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-slate-500">
          {agreement.terms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ol>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <SignatureBlock title="Landlord signature" signature={agreement.ownerSignature} />
          <SignatureBlock title="Tenant signature" signature={agreement.tenantSignature} />
        </div>

        <p className="mt-6 text-xs text-slate-500">
          This is a standard template. Have it reviewed, and notarised if you need to, before relying on it for a high-value
          tenancy.
        </p>
      </article>

      {canSign && (
        <div className="mt-6 space-y-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 print:hidden">
          <h2 className="flex items-center gap-2 text-base font-semibold text-navy-900 dark:text-white">
            <PenLine className="h-4 w-4" aria-hidden="true" />
            Sign this agreement
          </h2>
          <Input
            label="Type your full name to sign"
            placeholder={user.name}
            value={typedName}
            onChange={(e) => {
              setTypedName(e.target.value)
              setSignError(null)
            }}
            error={signError ?? undefined}
          />
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-navy-900 dark:text-white">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked)
                setSignError(null)
              }}
              className="mt-0.5 h-4 w-4 rounded accent-blue-500"
            />
            I have read the agreement and accept its terms.
          </label>
          <Button onClick={handleSign} loading={signing}>
            Sign agreement
          </Button>
        </div>
      )}

      {isTenant && agreement.status === 'awaiting_owner' && (
        <p className="mt-6 text-sm text-slate-500 print:hidden">The landlord signs first. You will be notified when it is your turn.</p>
      )}

      {(disputes ?? []).length > 0 && (
        <div className="mt-6 space-y-3 print:hidden">
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">Disputes</h2>
          {disputes!.map((dispute) => (
            <div key={dispute.id} className="rounded-xl border border-navy-700/10 p-4 dark:border-navy-700">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium capitalize text-navy-900 dark:text-white">{dispute.topic}</p>
                <Badge variant={DISPUTE_VARIANT[dispute.status]} className="capitalize">
                  {dispute.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{dispute.description}</p>
              {dispute.resolution && <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">Outcome: {dispute.resolution}</p>}
            </div>
          ))}
        </div>
      )}

      {(isTenant || isOwner) && (agreement.status === 'active' || agreement.status === 'ended') && (
        <button
          type="button"
          onClick={() => setDisputeOpen(true)}
          className="mt-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-rose-500 print:hidden"
        >
          <Scale className="h-4 w-4" aria-hidden="true" />
          Problem with this tenancy? Ask NyumbaLink to mediate
        </button>
      )}

      <Modal
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        title="Open a dispute"
        description="An admin reviews both sides and the agreement before proposing an outcome."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDisputeOpen(false)} disabled={submittingDispute}>
              Cancel
            </Button>
            <Button onClick={handleDispute} loading={submittingDispute}>
              Open dispute
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="What is it about?" options={DISPUTE_TOPICS} value={topic} onChange={(e) => setTopic(e.target.value as DisputeTopic)} />
          <Textarea
            label="What happened?"
            rows={5}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setDisputeError(null)
            }}
            error={disputeError ?? undefined}
          />
        </div>
      </Modal>
    </div>
  )
}
