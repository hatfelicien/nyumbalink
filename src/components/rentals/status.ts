import type {
  AgreementStatus,
  MaintenanceCategory,
  MaintenanceStatus,
  MaintenanceUrgency,
  RentalApplicationStatus,
  ViewingStatus,
} from '../../types'

type BadgeVariant = 'neutral' | 'brand' | 'success' | 'pending' | 'danger'

export const VIEWING_VARIANT: Record<ViewingStatus, BadgeVariant> = {
  requested: 'pending',
  confirmed: 'success',
  declined: 'danger',
  completed: 'brand',
  cancelled: 'neutral',
}

export const APPLICATION_VARIANT: Record<RentalApplicationStatus, BadgeVariant> = {
  submitted: 'pending',
  approved: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
}

export const AGREEMENT_STATUS: Record<AgreementStatus, { label: string; variant: BadgeVariant }> = {
  awaiting_owner: { label: 'Awaiting landlord signature', variant: 'pending' },
  awaiting_tenant: { label: 'Awaiting tenant signature', variant: 'pending' },
  active: { label: 'Active', variant: 'success' },
  ended: { label: 'Ended', variant: 'neutral' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

export const MAINTENANCE_STATUS: Record<MaintenanceStatus, { label: string; variant: BadgeVariant }> = {
  open: { label: 'Open', variant: 'pending' },
  in_progress: { label: 'In progress', variant: 'brand' },
  resolved: { label: 'Resolved', variant: 'success' },
}

export const URGENCY_VARIANT: Record<MaintenanceUrgency, BadgeVariant> = {
  low: 'neutral',
  medium: 'pending',
  urgent: 'danger',
}

export const MAINTENANCE_CATEGORIES: { value: MaintenanceCategory; label: string }[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electricity / cash power' },
  { value: 'water', label: 'Water supply / tank' },
  { value: 'security', label: 'Locks, gate or security' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'structural', label: 'Roof, walls or floor' },
  { value: 'other', label: 'Other' },
]

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
