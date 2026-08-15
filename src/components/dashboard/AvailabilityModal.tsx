import { useEffect, useState } from 'react'
import { propertiesService } from '../../services/propertiesService'
import type { Property, PropertyStatus } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'

const RENT_STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'rented', label: 'Rented' },
]

const SALE_STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved (offer pending)' },
  { value: 'sold', label: 'Sold' },
]

export interface AvailabilityModalProps {
  property: Property | null
  onClose: () => void
  onSaved: () => void
}

export function AvailabilityModal({ property, onClose, onSaved }: AvailabilityModalProps) {
  const [status, setStatus] = useState<PropertyStatus>('available')
  const [availableFrom, setAvailableFrom] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (property) {
      setStatus(property.status)
      setAvailableFrom(property.availableFrom?.slice(0, 10) ?? '')
    }
  }, [property])

  if (!property) return null

  const options = property.purpose === 'sale' ? SALE_STATUS_OPTIONS : RENT_STATUS_OPTIONS

  async function handleSave() {
    setSaving(true)
    await propertiesService.update(property!.id, {
      status,
      availableFrom: status === 'available' ? undefined : availableFrom ? new Date(availableFrom).toISOString() : undefined,
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <Modal
      open={!!property}
      onClose={onClose}
      title="Update availability"
      description={`"${property.title}"`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Status"
          options={options}
          value={status}
          onChange={(e) => setStatus(e.target.value as PropertyStatus)}
        />
        {status !== 'available' && (
          <Input
            label="Available again from"
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            hint="Shown to guests so they know when to check back."
          />
        )}
      </div>
    </Modal>
  )
}
