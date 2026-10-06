import { useEffect, useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { viewingsService } from '../../services/rentalsService'
import type { Property } from '../../types'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Textarea } from '../ui/Textarea'

/** Daylight slots only — a home should be seen, and a stranger met, in daylight. */
const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '17:30']

function toDateInput(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}

export interface ScheduleViewingModalProps {
  open: boolean
  onClose: () => void
  property: Property
  tenantId: string
}

export function ScheduleViewingModal({ open, onClose, property, tenantId }: ScheduleViewingModalProps) {
  const { showToast } = useToast()
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const [date, setDate] = useState(toDateInput(tomorrow))
  const [time, setTime] = useState(TIME_SLOTS[1])
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setDate(toDateInput(new Date(Date.now() + 24 * 60 * 60 * 1000)))
      setTime(TIME_SLOTS[1])
      setNote('')
      setError(null)
    }
  }, [open])

  async function handleSubmit() {
    const scheduledAt = new Date(`${date}T${time}:00`)
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
      setError('Pick a date and time in the future.')
      return
    }
    setSubmitting(true)
    await viewingsService.request({
      propertyId: property.id,
      tenantId,
      ownerId: property.ownerId,
      scheduledAt: scheduledAt.toISOString(),
      note: note.trim() || undefined,
    })
    setSubmitting(false)
    showToast('Viewing requested', {
      description: 'The landlord will confirm or suggest another time. Track it under My rentals.',
      variant: 'success',
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule a viewing"
      description={`"${property.title}" — viewings are free.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Request viewing
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          min={toDateInput(new Date())}
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            setError(null)
          }}
          error={error ?? undefined}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium text-navy-900 dark:text-white">Time</p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  setTime(slot)
                  setError(null)
                }}
                aria-pressed={time === slot}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  time === slot
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
        <Textarea
          label="Note for the landlord (optional)"
          rows={2}
          placeholder="e.g. I will come with my sister."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </Modal>
  )
}
