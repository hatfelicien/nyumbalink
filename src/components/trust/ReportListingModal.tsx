import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { reportsService } from '../../services/trustService'
import type { Property, ReportReason } from '../../types'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'upfront_payment', label: 'Asked for money before a viewing' },
  { value: 'not_owner', label: 'Not the real landlord / charged a viewing fee' },
  { value: 'fake_photos', label: 'Photos do not match the home' },
  { value: 'already_taken', label: 'Already rented or sold' },
  { value: 'duplicate', label: 'Same home listed more than once' },
  { value: 'wrong_info', label: 'Wrong price, location or details' },
  { value: 'other', label: 'Something else' },
]

export interface ReportListingModalProps {
  open: boolean
  onClose: () => void
  property: Property
}

export function ReportListingModal({ open, onClose, property }: ReportListingModalProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [reason, setReason] = useState<ReportReason>('upfront_payment')
  const [details, setDetails] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('upfront_payment')
      setDetails('')
      setError(null)
    }
  }, [open])

  async function handleSubmit() {
    if (details.trim().length < 15) {
      setError('Tell us what happened in a sentence or two (15+ characters).')
      return
    }
    setSubmitting(true)
    if (user && (await reportsService.hasOpenReport(property.id, user.id))) {
      setSubmitting(false)
      setError('You already reported this listing. Our team is reviewing it.')
      return
    }
    const { autoFlagged } = await reportsService.create({
      propertyId: property.id,
      reporterId: user?.id,
      reason,
      details: details.trim(),
    })
    setSubmitting(false)
    showToast('Report sent', {
      description: autoFlagged
        ? 'Several people reported this listing, so it is now hidden while we review it.'
        : 'Thank you. Our team reviews every report.',
      variant: 'success',
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report this listing"
      description={`"${property.title}" — the landlord is not told who reported it.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} loading={submitting}>
            Send report
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="What is wrong?"
          options={REPORT_REASONS}
          value={reason}
          onChange={(e) => setReason(e.target.value as ReportReason)}
        />
        <Textarea
          label="What happened?"
          rows={4}
          placeholder="e.g. The person on the phone asked me to send MoMo to hold the house before I could visit."
          value={details}
          onChange={(e) => {
            setDetails(e.target.value)
            setError(null)
          }}
          error={error ?? undefined}
        />
      </div>
    </Modal>
  )
}
