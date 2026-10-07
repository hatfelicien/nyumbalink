import { useMemo, useState } from 'react'
import { Ban, CheckCircle2, Eye, Search, Trash2 } from 'lucide-react'
import { ViewUserModal } from '../../components/dashboard/ViewUserModal'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import type { TableColumn } from '../../components/ui/Table'
import { Table } from '../../components/ui/Table'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../hooks/useToast'
import { usersService } from '../../services/usersService'
import type { User } from '../../types'
import { formatDate } from '../../utils/format'

const STATUS_VARIANT = { active: 'success', pending: 'pending', suspended: 'danger', rejected: 'danger' } as const

export function AdminUsersPage() {
  const { data, loading, error, reload } = useAsync(() => usersService.getGuests(), [])
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return (data ?? []).filter(
      (user) => !search || user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()),
    )
  }, [data, search])

  async function toggleStatus(user: User) {
    setBusyId(user.id)
    const next = user.status === 'suspended' ? 'active' : 'suspended'
    await usersService.update(user.id, { status: next })
    showToast(next === 'suspended' ? 'User suspended' : 'User activated', { variant: 'success' })
    setBusyId(null)
    reload()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    await usersService.remove(deleteTarget.id)
    showToast('User removed', { variant: 'success' })
    setBusyId(null)
    setDeleteTarget(null)
    reload()
  }

  const columns: TableColumn<User>[] = [
    {
      key: 'name',
      header: 'User',
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
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    { key: 'createdAt', header: 'Joined', sortable: true, sortValue: (row) => row.createdAt, render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" aria-label="View" onClick={() => setViewingUser(row)}>
            <Eye className="h-4 w-4" />
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
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by name or email"
        aria-label="Search by name or email"
        leftIcon={<Search className="h-4 w-4" />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        containerClassName="sm:max-w-xs"
      />

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading ? (
        <Skeleton className="h-96 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search." />
      ) : (
        <Table columns={columns} data={filtered} getRowId={(row) => row.id} />
      )}

      <ViewUserModal user={viewingUser} onClose={() => setViewingUser(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove this user?"
        description={`"${deleteTarget?.name}" will be permanently removed.`}
        confirmLabel="Remove"
        loading={busyId === deleteTarget?.id}
      />
    </div>
  )
}
