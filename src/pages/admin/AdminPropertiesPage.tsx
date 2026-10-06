import { useMemo, useState } from 'react'
import { CheckCircle2, Copy, Flag, Search, Trash2 } from 'lucide-react'
import { VerificationBadge } from '../../components/trust/VerificationBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import type { TableColumn } from '../../components/ui/Table'
import { Table } from '../../components/ui/Table'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { propertiesService } from '../../services/propertiesService'
import { usersService } from '../../services/usersService'
import type { ListingStatus, Property } from '../../types'
import { formatRwf } from '../../utils/format'
import { findDuplicates } from '../../utils/verification'

const LISTING_VARIANT = { draft: 'neutral', pending: 'pending', published: 'success', flagged: 'danger' } as const
const LISTING_FILTERS = [
  { value: '', label: 'All listings' },
  { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'draft', label: 'Draft' },
  { value: 'duplicates', label: 'Possible duplicates' },
]

export function AdminPropertiesPage() {
  const { data, loading, error, reload } = useAsync(() => propertiesService.list(), [])
  const { data: users } = useAsync(() => usersService.list(), [])
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)

  const ownerName = (ownerId: string) => users?.find((u) => u.id === ownerId)?.name ?? 'Unknown'

  // Duplicate detection compares every listing against the rest, so it is computed once per load.
  const duplicates = useMemo(() => {
    const all = data ?? []
    return new Map(all.map((property) => [property.id, findDuplicates(property, all)] as const).filter(([, matches]) => matches.length > 0))
  }, [data])

  const filtered = useMemo(() => {
    return (data ?? []).filter((property) => {
      const matchesSearch = !search || property.title.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        !statusFilter || (statusFilter === 'duplicates' ? duplicates.has(property.id) : property.listingStatus === statusFilter)
      return matchesSearch && matchesStatus
    })
  }, [data, search, statusFilter, duplicates])

  async function setListingStatus(property: Property, listingStatus: ListingStatus) {
    setBusyId(property.id)
    await propertiesService.update(property.id, { listingStatus })
    showToast(`Listing ${listingStatus}`, { variant: 'success' })
    setBusyId(null)
    reload()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    await propertiesService.remove(deleteTarget.id)
    showToast('Listing removed', { variant: 'success' })
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
            <p className="text-xs text-slate-500">{ownerName(row.ownerId)}</p>
            {duplicates.has(row.id) && (
              <p
                className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                title={duplicates.get(row.id)!.map((m) => `${m.property.title} (${ownerName(m.property.ownerId)}): ${m.reasons.join(', ')}`).join('\n')}
              >
                <Copy className="h-3 w-3" aria-hidden="true" />
                Possible duplicate of {ownerName(duplicates.get(row.id)![0].property.ownerId)}'s listing
              </p>
            )}
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
      key: 'verification',
      header: 'Verification',
      render: (row) => <VerificationBadge kind="property" status={row.verification} showUnverified />,
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
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Approve"
            disabled={busyId === row.id}
            onClick={() => setListingStatus(row, 'published')}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Flag"
            disabled={busyId === row.id}
            onClick={() => setListingStatus(row, 'flagged')}
          >
            <Flag className="h-4 w-4 text-amber-500" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search listings"
          aria-label="Search listings"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="sm:max-w-xs"
        />
        <Select aria-label="Filter by status" options={LISTING_FILTERS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48" />
      </div>

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading ? (
        <Skeleton className="h-96 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No listings found" description="Try adjusting your search or filters." />
      ) : (
        <Table columns={columns} data={filtered} getRowId={(row) => row.id} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove this listing?"
        description={`"${deleteTarget?.title}" will be permanently removed from the platform.`}
        confirmLabel="Remove"
        loading={busyId === deleteTarget?.id}
      />
    </div>
  )
}
