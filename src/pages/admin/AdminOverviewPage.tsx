import { Building2, ClipboardList, UserCog, Users } from 'lucide-react'
import { BarChart } from '../../components/dashboard/BarChart'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { useAsync } from '../../hooks/useAsync'
import { applicationsService } from '../../services/applicationsService'
import { propertiesService } from '../../services/propertiesService'
import { usersService } from '../../services/usersService'
import { KIGALI_DISTRICTS } from '../../utils/constants'
import { buildMonthlyTrend } from '../../utils/mockSeries'
import { RecentActivityFeed } from '../../components/dashboard/RecentActivityFeed'

export function AdminOverviewPage() {
  const { data: properties, loading: loadingProperties, error, reload } = useAsync(() => propertiesService.list(), [])
  const { data: users, loading: loadingUsers } = useAsync(() => usersService.list(), [])
  const { data: applications, loading: loadingApplications } = useAsync(() => applicationsService.list(), [])

  const loading = loadingProperties || loadingUsers || loadingApplications

  if (error) return <ErrorState onRetry={reload} />

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  const owners = (users ?? []).filter((u) => u.role === 'owner')
  const guests = (users ?? []).filter((u) => u.role === 'guest')
  const pendingApplications = (applications ?? []).filter((a) => a.status === 'pending')
  const list = properties ?? []

  const perDistrict = KIGALI_DISTRICTS.map((district) => ({
    label: district,
    value: list.filter((p) => p.district.startsWith(district)).length,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total listings" value={list.length} icon={Building2} />
        <StatCard label="Owners" value={owners.length} icon={UserCog} />
        <StatCard label="Guests" value={guests.length} icon={Users} />
        <StatCard label="Pending applications" value={pendingApplications.length} icon={ClipboardList} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">Listings per month</h2>
          <p className="text-sm text-slate-500">New listings created, last 6 months</p>
          <div className="mt-6">
            <BarChart data={buildMonthlyTrend(list.map((p) => p.createdAt))} />
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">Listings per district</h2>
          <p className="text-sm text-slate-500">Across Kigali</p>
          <div className="mt-6">
            <BarChart data={perDistrict} />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-navy-900 dark:text-white">Recent activity</h2>
        <div className="mt-4">
          <RecentActivityFeed properties={list} applications={applications ?? []} />
        </div>
      </Card>
    </div>
  )
}
