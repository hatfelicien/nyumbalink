import { useEffect, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { maintenanceService } from '../../services/rentalsService'
import type { WithParties } from '../../services/rentalsService'
import type { Agreement, MaintenanceCategory, MaintenanceUrgency } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { MAINTENANCE_CATEGORIES } from './status'

const URGENCY_OPTIONS: { value: MaintenanceUrgency; label: string }[] = [
  { value: 'low', label: 'Low — can wait' },
  { value: 'medium', label: 'Medium — this week' },
  { value: 'urgent', label: 'Urgent — unsafe or no water / power' },
]

export interface MaintenanceRequestModalProps {
  open: boolean
  onClose: () => void
  /** The tenant's active tenancies — a repair is always raised against one of them. */
  agreements: WithParties<Agreement>[]
  onCreated: () => void
}

export function MaintenanceRequestModal({ open, onClose, agreements, onCreated }: MaintenanceRequestModalProps) {
  const { showToast } = useToast()
  const [agreementId, setAgreementId] = useState('')
  const [category, setCategory] = useState<MaintenanceCategory>('plumbing')
  const [urgency, setUrgency] = useState<MaintenanceUrgency>('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setAgreementId(agreements[0]?.id ?? '')
      setCategory('plumbing')
      setUrgency('medium')
      setTitle('')
      setDescription('')
      setError(null)
    }
    // Only reset when the modal opens, not when the agreements list reloads behind it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleSubmit() {
    const agreement = agreements.find((a) => a.id === agreementId)
    if (!agreement) return setError('Choose the home this is about.')
    if (title.trim().length < 5) return setError('Give the problem a short title.')
    if (description.trim().length < 15) return setError('Describe the problem in a sentence or two.')

    setSubmitting(true)
    await maintenanceService.create({
      propertyId: agreement.propertyId,
      tenantId: agreement.tenantId,
      ownerId: agreement.ownerId,
      category,
      urgency,
      title: title.trim(),
      description: description.trim(),
    })
    setSubmitting(false)
    showToast('Repair reported', { description: 'Your landlord has been notified.', variant: 'success' })
    onCreated()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report a repair"
      description="Your landlord is notified straight away and the request stays on record."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Send to landlord
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {agreements.length > 1 && (
          <Select
            label="Home"
            options={agreements.map((a) => ({ value: a.id, label: a.property?.title ?? 'Rental' }))}
            value={agreementId}
            onChange={(e) => setAgreementId(e.target.value)}
          />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            options={MAINTENANCE_CATEGORIES}
            value={category}
            onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
          />
          <Select
            label="Urgency"
            options={URGENCY_OPTIONS}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as MaintenanceUrgency)}
          />
        </div>
        <Input
          label="What is the problem?"
          placeholder="e.g. Kitchen tap is leaking"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setError(null)
          }}
        />
        <Textarea
          label="Details"
          rows={4}
          placeholder="Where is it, when did it start, and is anything unsafe?"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            setError(null)
          }}
          error={error ?? undefined}
        />
      </div>
    </Modal>
  )
}
