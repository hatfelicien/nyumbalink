import { useEffect, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { verificationService } from '../../services/verificationService'
import type { Property, VerificationDocType, VerificationDocument } from '../../types'
import { cn } from '../../utils/cn'
import { validateUpi } from '../../utils/verification'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Textarea } from '../ui/Textarea'
import { DocumentField } from './DocumentField'

type Relationship = 'owner' | 'agent'
type Documents = Partial<Record<VerificationDocType, VerificationDocument>>

const RELATIONSHIPS: { value: Relationship; label: string; description: string }[] = [
  { value: 'owner', label: 'I hold the title', description: 'The land title or lease is in my name.' },
  { value: 'agent', label: 'I manage it for the owner', description: 'A relative or client holds the title.' },
]

export interface PropertyVerificationModalProps {
  property: Property | null
  ownerId: string
  onClose: () => void
  onSubmitted: () => void
}

export function PropertyVerificationModal({ property, ownerId, onClose, onSubmitted }: PropertyVerificationModalProps) {
  const { showToast } = useToast()
  const [relationship, setRelationship] = useState<Relationship>('owner')
  const [upi, setUpi] = useState('')
  const [documents, setDocuments] = useState<Documents>({})
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{ upi?: string; title?: string; letter?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (property) {
      setRelationship('owner')
      setUpi('')
      setDocuments({})
      setNote('')
      setErrors({})
    }
  }, [property])

  if (!property) return null

  function setDocument(type: VerificationDocType, document: VerificationDocument | undefined) {
    setDocuments((current) => ({ ...current, [type]: document }))
    setErrors({})
  }

  async function handleSubmit() {
    const nextErrors: typeof errors = {}
    const upiError = validateUpi(upi)
    if (upiError) nextErrors.upi = upiError
    if (!documents.land_title && !documents.lease_contract) nextErrors.title = 'Attach the land title or the lease contract'
    if (relationship === 'agent' && !documents.authorisation_letter) {
      nextErrors.letter = 'Attach the notarised letter from the title holder'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    await verificationService.submitProperty({
      ownerId,
      propertyId: property!.id,
      upi,
      relationship,
      documents: Object.values(documents).filter((doc): doc is VerificationDocument => Boolean(doc)),
      note: note.trim() || undefined,
    })
    setSubmitting(false)
    showToast('Documents submitted', { description: 'We will notify you as soon as a reviewer decides.', variant: 'success' })
    onSubmitted()
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Verify this property"
      description={`"${property.title}" — prove you have the right to rent it out.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Submit for review
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {RELATIONSHIPS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRelationship(option.value)}
              aria-pressed={relationship === option.value}
              className={cn(
                'rounded-xl border px-3.5 py-3 text-left transition-colors',
                relationship === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-navy-700/15 hover:border-blue-400 dark:border-navy-700',
              )}
            >
              <p className="text-sm font-medium text-navy-900 dark:text-white">{option.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{option.description}</p>
            </button>
          ))}
        </div>

        <Input
          label="UPI (parcel number)"
          placeholder="1/02/09/03/1184"
          value={upi}
          onChange={(e) => {
            setUpi(e.target.value)
            setErrors({})
          }}
          error={errors.upi}
          hint="Printed at the top of the land title: province / district / sector / cell / parcel."
        />

        <DocumentField
          type="land_title"
          required
          value={documents.land_title}
          onChange={(doc) => setDocument('land_title', doc)}
          error={documents.lease_contract ? undefined : errors.title}
          onError={(message) => setErrors({ title: message })}
          hint="The e-title PDF, or a clear photo of the paper title."
        />
        <DocumentField
          type="lease_contract"
          value={documents.lease_contract}
          onChange={(doc) => setDocument('lease_contract', doc)}
          hint="Use this instead if you hold the land on a lease contract."
        />
        {relationship === 'agent' && (
          <DocumentField
            type="authorisation_letter"
            required
            value={documents.authorisation_letter}
            onChange={(doc) => setDocument('authorisation_letter', doc)}
            error={errors.letter}
            onError={(message) => setErrors({ letter: message })}
            hint="Signed by the title holder before a notary and naming you as the manager."
          />
        )}
        <DocumentField
          type="utility_bill"
          value={documents.utility_bill}
          onChange={(doc) => setDocument('utility_bill', doc)}
          hint="A recent bill for this address speeds up the review."
        />

        <Textarea
          label="Anything the reviewer should know? (optional)"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </Modal>
  )
}
