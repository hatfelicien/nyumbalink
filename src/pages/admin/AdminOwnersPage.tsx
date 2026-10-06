import { useMemo, useState } from 'react'
import { Ban, CheckCircle2, Eye, Pencil, Plus, Search, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import { OwnerFormModal } from '../../components/dashboard/OwnerFormModal'
import type { OwnerFormValues } from '../../components/dashboard/OwnerFormModal'
import { ViewUserModal } from '../../components/dashboard/ViewUserModal'
import { VerificationBadge } from '../../components/trust/VerificationBadge'
import { Avatar } from '../../components/ui/Avatar'
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
import { usersService } from '../../services/usersService'
import type { User } from '../../types'
import { formatDate } from '../../utils/format'

const STATUS_VARIANT = { active: 'success', pending: 'pending', suspended: 'danger' } as const
const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
]

export function AdminOwnersPage() {
  const { data, loading, error, reload } = useAsync(() => usersService.getOwners(), [])
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingOwner, setEditingOwner] = useState<User | null>(null)
  const [viewingOwner, setViewingOwner] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return (data ?? []).filter((owner) => {
      const matchesSearch =
        !search ||
        owner.name.toLowerCase().includes(search.toLowerCase()) ||
        owner.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || owner.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [data, search, statusFilter])

  async function handleFormSubmit(values: OwnerFormValues) {
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      city: values.city,
      nationalId: values.nationalId,
      status: values.status,
    }
    if (editingOwner) {
      await usersService.update(editingOwner.id, payload)
      showToast('Owner updated', { variant: 'success' })
    } else {
      await usersService.addOwner(payload)
      showToast('Owner added', { variant: 'success' })
    }
    setFormOpen(false)
    setEditingOwner(null)
    reload()
  }

  async function toggleStatus(owner: User) {
    setBusyId(owner.id)
    const next = owner.status === 'suspended' ? 'active' : 'suspended'
    await usersService.update(owner.id, { status: next })
    showToast(next === 'suspended' ? 'Owner suspended' : 'Owner activated', { variant: 'success' })
    setBusyId(null)
    reload()
  }

  async function toggleVerified(owner: User) {
    setBusyId(owner.id)
    const verified = owner.verification === 'verified'
    await usersService.update(owner.id, {
      verification: verified ? 'unverified' : 'verified',
      verifiedAt: verified ? undefined : new Date().toISOString(),
    })
    showToast(verified ? 'Verification removed' : 'Owner verified', { variant: 'success' })
    setBusyId(null)
    reload()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    await usersService.remove(deleteTarget.id)
    showToast('Owner removed', { variant: 'success' })
    setBusyId(null)
    setDeleteTarget(null)
    reload()
  }

  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      header: 'Owner',
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatar} size="sm" />
          <div>
            <p className="font-medium text-navy-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'city', header: 'City', render: (row) => row.city ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'verified',
      header: 'Verified',
      render: (row) => <VerificationBadge kind="landlord" status={row.verification ?? 'unverified'} showUnverified />,
    },
    { key: 'createdAt', header: 'Joined', sortable: true, sortValue: (row) => row.createdAt, render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" aria-label="View" onClick={() => setViewingOwner(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit"
            onClick={() => {
              setEditingOwner(row)
              setFormOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={row.status === 'suspended' ? 'Activate' : 'Suspend'}
            disabled={busyId === row.id}
            onClick={() => toggleStatus(row)}
          >
            {row.status === 'suspended' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Ban className="h-4 w-4 text-amber-500" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={row.verification === 'verified' ? 'Remove verification' : 'Verify owner'}
            disabled={busyId === row.id}
            onClick={() => toggleVerified(row)}
          >
            {row.verification === 'verified' ? <ShieldOff className="h-4 w-4 text-slate-500" /> : <ShieldCheck className="h-4 w-4 text-blue-500" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search by name or email"
            aria-label="Search by name or email"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="sm:max-w-xs"
          />
          <Select aria-label="Filter by status" options={STATUS_FILTERS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48" />
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditingOwner(null)
            setFormOpen(true)
          }}
        >
          Add owner
        </Button>
      </div>

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading ? (
        <Skeleton className="h-96 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No owners found" description="Try adjusting your search or filters." />
      ) : (
        <Table columns={columns} data={filtered} getRowId={(row) => row.id} />
      )}

      <OwnerFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingOwner(null)
        }}
        onSubmit={handleFormSubmit}
        owner={editingOwner}
      />
      <ViewUserModal user={viewingOwner} onClose={() => setViewingOwner(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove this owner?"
        description={`"${deleteTarget?.name}" and their listings will be removed from the platform.`}
        confirmLabel="Remove"
        loading={busyId === deleteTarget?.id}
      />
    </div>
  )
}
