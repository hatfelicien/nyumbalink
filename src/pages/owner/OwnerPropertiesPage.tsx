import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { VerificationBadge } from '../../components/trust/VerificationBadge'
import { AvailabilityModal } from '../../components/dashboard/AvailabilityModal'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import type { TableColumn } from '../../components/ui/Table'
import { Table } from '../../components/ui/Table'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { propertiesService } from '../../services/propertiesService'
import type { Property } from '../../types'
import { formatDate, formatRwf } from '../../utils/format'

const LISTING_VARIANT = { draft: 'neutral', pending: 'pending', published: 'success', flagged: 'danger' } as const
const STATUS_VARIANT = { available: 'success', reserved: 'pending', rented: 'danger', sold: 'danger' } as const

export function OwnerPropertiesPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(() => propertiesService.getByOwner(user!.id), [user?.id])
  const { showToast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)
  const [availabilityTarget, setAvailabilityTarget] = useState<Property | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function togglePublish(property: Property) {
    setBusyId(property.id)
    const next = property.listingStatus === 'published' ? 'draft' : 'published'
    await propertiesService.update(property.id, { listingStatus: next })
    showToast(next === 'published' ? 'Listing published' : 'Listing unpublished', { variant: 'success' })
    setBusyId(null)
    reload()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    await propertiesService.remove(deleteTarget.id)
    showToast('Property deleted', { variant: 'success' })
    setBusyId(null)
    setDeleteTarget(null)
    reload()
  }

  const columns: TableColumn<Property>[] = [
    {
      key: 'title',
      header: 'Property',
      sortable: true,
      sortValue: (row) => row.title,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.images[0]} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="truncate font-medium text-navy-900 dark:text-white">{row.title}</p>
            <p className="text-xs text-slate-500">{row.district}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      render: (row) => <Badge variant="brand">{row.purpose === 'sale' ? 'For sale' : 'For rent'}</Badge>,
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      sortValue: (row) => row.price,
      render: (row) => (
        <>
          {formatRwf(row.price)}
          {row.purpose === 'rent' && <span className="text-slate-500">/mo</span>}
        </>
      ),
    },
    {
      key: 'status',
      header: 'Availability',
      render: (row) => (
        <button type="button" onClick={() => setAvailabilityTarget(row)} className="group inline-flex items-center gap-1.5">
          <Badge variant={STATUS_VARIANT[row.status]} className="capitalize group-hover:opacity-80">
            {row.status}
          </Badge>
          {row.status !== 'available' && row.availableFrom && (
            <span className="text-xs text-slate-500">from {formatDate(row.availableFrom)}</span>
          )}
        </button>
      ),
    },
    {
      key: 'listingStatus',
      header: 'Listing',
      render: (row) => (
        <Badge variant={LISTING_VARIANT[row.listingStatus]} className="capitalize">
          {row.listingStatus}
        </Badge>
      ),
    },
    {
      key: 'verification',
      header: 'Verification',
      render: (row) =>
        row.verification === 'verified' || row.verification === 'pending' ? (
          <VerificationBadge kind="property" status={row.verification} showUnverified />
        ) : (
          <Link to="/owner/verification" className="text-sm font-medium text-blue-500 hover:text-blue-400">
            {row.verification === 'rejected' ? 'Resubmit documents' : 'Verify now'}
          </Link>
        ),
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      sortValue: (row) => row.views,
      render: (row) => row.views.toLocaleString(),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label={row.listingStatus === 'published' ? 'Unpublish' : 'Publish'}
            disabled={busyId === row.id}
            onClick={() => togglePublish(row)}
          >
            {row.listingStatus === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Update availability" onClick={() => setAvailabilityTarget(row)}>
            <CalendarClock className="h-4 w-4" />
          </Button>
          <Link to={`/owner/properties/${row.id}/edit`}>
            <Button variant="ghost" size="icon" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Manage the properties you have listed.</p>
        <Link to="/owner/properties/new">
          <Button icon={<Plus className="h-4 w-4" />} className="w-full sm:w-auto">
            Add property
          </Button>
        </Link>
      </div>

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No properties yet"
          description="Add your first property to start receiving enquiries."
          action={
            <Link to="/owner/properties/new">
              <Button>Add property</Button>
            </Link>
          }
        />
      ) : (
        <Table columns={columns} data={data!} getRowId={(row) => row.id} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this property?"
        description={`"${deleteTarget?.title}" will be permanently removed from your listings.`}
        confirmLabel="Delete"
        loading={busyId === deleteTarget?.id}
      />
      <AvailabilityModal property={availabilityTarget} onClose={() => setAvailabilityTarget(null)} onSaved={reload} />
    </div>
  )
}
