import { useEffect, useState } from 'react'
import { BadgeCheck, FileText, ShieldCheck, TriangleAlert } from 'lucide-react'
import { DocumentField } from '../../components/trust/DocumentField'
import { PropertyVerificationModal } from '../../components/trust/PropertyVerificationModal'
import { VerificationBadge } from '../../components/trust/VerificationBadge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { propertiesService } from '../../services/propertiesService'
import { usersService } from '../../services/usersService'
import { verificationService } from '../../services/verificationService'
import type { Property, User, VerificationDocument, VerificationRequest } from '../../types'
import { formatDate } from '../../utils/format'
import { DOC_TYPE_LABELS, validateNationalId } from '../../utils/verification'

function RejectionNote({ request }: { request: VerificationRequest | undefined }) {
  if (!request?.reviewerNote) return null
  return (
    <p className="flex items-start gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-medium">Reviewer note:</span> {request.reviewerNote}
      </span>
    </p>
  )
}

function SubmittedDocuments({ request }: { request: VerificationRequest }) {
  return (
    <ul className="space-y-1.5 text-sm text-slate-500">
      {request.documents.map((doc) => (
        <li key={doc.id} className="flex items-center gap-2">
          <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
          {DOC_TYPE_LABELS[doc.type]} — {doc.fileName}
        </li>
      ))}
    </ul>
  )
}

interface IdentityCardProps {
  owner: User
  latest: VerificationRequest | undefined
  onSubmitted: () => void
}

function IdentityCard({ owner, latest, onSubmitted }: IdentityCardProps) {
  const { showToast } = useToast()
  const status = owner.verification ?? 'unverified'
  const [docType, setDocType] = useState<'national_id' | 'passport'>('national_id')
  const [idNumber, setIdNumber] = useState(owner.nationalId ?? '')
  const [idDocument, setIdDocument] = useState<VerificationDocument>()
  const [selfie, setSelfie] = useState<VerificationDocument>()
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{ idNumber?: string; idDocument?: string; selfie?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    const nextErrors: typeof errors = {}
    const numberError =
      docType === 'national_id' ? validateNationalId(idNumber) : idNumber.trim().length < 6 ? 'Enter the passport number' : null
    if (numberError) nextErrors.idNumber = numberError
    if (!idDocument) nextErrors.idDocument = 'Attach a photo of the document'
    if (!selfie) nextErrors.selfie = 'Attach a selfie holding the document'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !idDocument || !selfie) return

    setSubmitting(true)
    await verificationService.submitOwner({
      ownerId: owner.id,
      idNumber,
      documents: [{ ...idDocument, type: docType }, selfie],
      note: note.trim() || undefined,
    })
    setSubmitting(false)
    showToast('ID submitted', { description: 'We will notify you as soon as a reviewer decides.', variant: 'success' })
    onSubmitted()
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-navy-900 dark:text-white">Step 1 — Your identity</h2>
            <p className="text-sm text-slate-500">Shows tenants that a real, identified person is behind your listings.</p>
          </div>
        </div>
        <VerificationBadge kind="landlord" status={status} showUnverified />
      </div>

      {status === 'verified' && (
        <p className="text-sm text-slate-500">
          ID ending {(owner.nationalId ?? '').slice(-4)} was verified
          {owner.verifiedAt ? ` on ${formatDate(owner.verifiedAt)}` : ''}. The "Verified landlord" badge shows on your profile and
          every listing.
        </p>
      )}

      {status === 'pending' && latest && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Submitted on {formatDate(latest.submittedAt)}. We will notify you as soon as a reviewer decides.</p>
          <SubmittedDocuments request={latest} />
        </div>
      )}

      {(status === 'unverified' || status === 'rejected') && (
        <div className="space-y-4">
          {status === 'rejected' && <RejectionNote request={latest} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Document"
              options={[
                { value: 'national_id', label: DOC_TYPE_LABELS.national_id },
                { value: 'passport', label: DOC_TYPE_LABELS.passport },
              ]}
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value as typeof docType)
                setErrors({})
              }}
            />
            <Input
              label={docType === 'national_id' ? 'National ID number' : 'Passport number'}
              inputMode={docType === 'national_id' ? 'numeric' : 'text'}
              placeholder={docType === 'national_id' ? '1 1987 8 0012345 6 78' : ''}
              value={idNumber}
              onChange={(e) => {
                setIdNumber(e.target.value)
                setErrors({})
              }}
              error={errors.idNumber}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DocumentField
              type={docType}
              required
              value={idDocument}
              onChange={(doc) => {
                setIdDocument(doc)
                setErrors({})
              }}
              error={errors.idDocument}
              onError={(message) => setErrors({ idDocument: message })}
              hint="All four corners visible, no glare."
            />
            <DocumentField
              type="selfie"
              required
              value={selfie}
              onChange={(doc) => {
                setSelfie(doc)
                setErrors({})
              }}
              error={errors.selfie}
              onError={(message) => setErrors({ selfie: message })}
              hint="Hold the document next to your face."
            />
          </div>
          <Textarea label="Note for the reviewer (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <Button onClick={handleSubmit} loading={submitting}>
            Submit ID for review
          </Button>
          <p className="text-xs text-slate-500">
            Your documents are only seen by NyumbaLink reviewers. Tenants see the badge, never your ID number.
          </p>
        </div>
      )}
    </Card>
  )
}

export function OwnerVerificationPage() {
  const { user, updateUser } = useAuth()
  const ownerId = user!.id
  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        usersService.getById(ownerId),
        propertiesService.getByOwner(ownerId),
        verificationService.getByOwner(ownerId),
      ]),
    [ownerId],
  )
  const [verifyTarget, setVerifyTarget] = useState<Property | null>(null)

  const owner = data?.[0]

  // The session copy of the user goes stale when an admin approves or rejects; refresh it from the service.
  useEffect(() => {
    if (owner && user && (owner.verification !== user.verification || owner.verifiedAt !== user.verifiedAt)) updateUser(owner)
  }, [owner, user, updateUser])

  if (error) return <ErrorState onRetry={reload} />
  if (loading && !data) return <Skeleton className="h-96 w-full" />
  if (!data || !owner) return <ErrorState onRetry={reload} />

  const [, properties, requests] = data
  const latestOwnerRequest = requests.find((r) => r.subject === 'owner')
  const latestFor = (propertyId: string) => requests.find((r) => r.subject === 'property' && r.propertyId === propertyId)
  const verifiedCount = properties.filter((p) => p.verification === 'verified').length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl bg-navy-900 p-6 text-white">
        <h2 className="text-lg font-semibold">Earn the badges tenants look for</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-white/70">
          Tenants can filter to verified homes only. A listing shows as <span className="font-medium text-white">Fully verified</span>{' '}
          once both checks pass: your identity, and your right to rent out that specific property.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <VerificationBadge kind="landlord" solid />
          <VerificationBadge kind="property" solid />
        </div>
      </div>

      <IdentityCard key={owner.verification} owner={owner} latest={latestOwnerRequest} onSubmitted={reload} />

      <Card className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BadgeCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-navy-900 dark:text-white">Step 2 — Your properties</h2>
              <p className="text-sm text-slate-500">Each listing is checked against its land title or lease.</p>
            </div>
          </div>
          <p className="text-sm font-medium text-navy-900 dark:text-white">
            {verifiedCount} of {properties.length} verified
          </p>
        </div>

        {properties.length === 0 ? (
          <EmptyState title="No properties yet" description="Add a listing first, then verify it here." />
        ) : (
          <ul className="divide-y divide-navy-700/10 dark:divide-navy-700">
            {properties.map((property) => {
              const latest = latestFor(property.id)
              const canSubmit = property.verification === 'unverified' || property.verification === 'rejected'
              return (
                <li key={property.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <img src={property.images[0]} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-900 dark:text-white">{property.title}</p>
                      <p className="text-xs text-slate-500">
                        {property.verification === 'verified' && property.verifiedAt
                          ? `UPI ${property.upi ?? '—'} · verified ${formatDate(property.verifiedAt)}`
                          : property.verification === 'pending' && latest
                            ? `Submitted ${formatDate(latest.submittedAt)}`
                            : property.district}
                      </p>
                    </div>
                    <VerificationBadge kind="property" status={property.verification} showUnverified />
                    {canSubmit && (
                      <Button size="sm" variant="secondary" onClick={() => setVerifyTarget(property)}>
                        {property.verification === 'rejected' ? 'Resubmit' : 'Verify'}
                      </Button>
                    )}
                  </div>
                  {property.verification === 'rejected' && <RejectionNote request={latest} />}
                </li>
              )
            })}
          </ul>
        )}

        {owner.verification !== 'verified' && properties.length > 0 && (
          <p className="text-xs text-slate-500">
            Tip: finish the ID check first. Reviewers match the name on the title to your verified identity.
          </p>
        )}
      </Card>

      <PropertyVerificationModal
        property={verifyTarget}
        ownerId={ownerId}
        onClose={() => setVerifyTarget(null)}
        onSubmitted={reload}
      />
    </div>
  )
}
