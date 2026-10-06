import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { AGREEMENT_STATUS } from '../../components/rentals/status'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import type { TableColumn } from '../../components/ui/Table'
import { Table } from '../../components/ui/Table'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { agreementsService } from '../../services/rentalsService'
import type { WithParties } from '../../services/rentalsService'
import type { Agreement } from '../../types'
import { formatDate, formatRwf } from '../../utils/format'

type Row = WithParties<Agreement>

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
}

export function OwnerTenantsPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(() => agreementsService.list({ role: 'owner', userId: user!.id }), [user?.id])

  const agreements = data ?? []
  const active = agreements.filter((a) => a.status === 'active')
  const toSign = agreements.filter((a) => a.status === 'awaiting_owner')

  const columns: TableColumn<Row>[] = [
    {
      key: 'tenant',
      header: 'Tenant',
      sortable: true,
      sortValue: (row) => row.tenant?.name ?? '',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.tenant?.name ?? 'Tenant'} src={row.tenant?.avatar} size="sm" />
          <div>
            <p className="font-medium text-navy-900 dark:text-white">{row.tenant?.name ?? 'Removed account'}</p>
            <p className="text-xs text-slate-500">{row.tenant?.phone}</p>
          </div>
        </div>
      ),
    },
    { key: 'property', header: 'Property', render: (row) => row.property?.title ?? 'Listing removed' },
    {
      key: 'rent',
      header: 'Rent',
      sortable: true,
      sortValue: (row) => row.monthlyRent,
      render: (row) => (
        <>
          {formatRwf(row.monthlyRent)}
          <span className="text-slate-500">/mo</span>
        </>
      ),
    },
    {
      key: 'term',
      header: 'Lease',
      sortable: true,
      sortValue: (row) => row.endDate,
      render: (row) => {
        const remaining = daysUntil(row.endDate)
        return (
          <div>
            <p>
              {formatDate(row.startDate)} – {formatDate(row.endDate)}
            </p>
            {row.status === 'active' && remaining <= 60 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {remaining > 0 ? `Ends in ${remaining} days — time to discuss renewal` : 'Lease period has ended'}
              </p>
            )}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Contract',
      render: (row) => <Badge variant={AGREEMENT_STATUS[row.status].variant}>{AGREEMENT_STATUS[row.status].label}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <Link to={`/agreements/${row.id}`}>
          <Button size="sm" variant={row.status === 'awaiting_owner' ? 'primary' : 'secondary'}>
            {row.status === 'awaiting_owner' ? 'Review and sign' : 'View contract'}
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        {active.length} active tenanc{active.length === 1 ? 'y' : 'ies'}
        {toSign.length > 0 && ` · ${toSign.length} contract${toSign.length === 1 ? '' : 's'} waiting for your signature`}
      </p>

      {error ? (
        <ErrorState onRetry={reload} />
      ) : loading && !data ? (
        <Skeleton className="h-96 w-full" />
      ) : agreements.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="Approve a rental application to draft a contract. Signed contracts and their tenants appear here."
          action={
            <Link to="/owner/applications">
              <Button>View applications</Button>
            </Link>
          }
        />
      ) : (
        <Table columns={columns} data={agreements} getRowId={(row) => row.id} />
      )}
    </div>
  )
}
