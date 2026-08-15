import { Building2, Eye, Inbox, MessageSquare } from 'lucide-react'
import { LineChart } from '../../components/dashboard/LineChart'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { enquiriesService } from '../../services/enquiriesService'
import { propertiesService } from '../../services/propertiesService'
import { buildWeeklyTrend } from '../../utils/mockSeries'

export function OwnerOverviewPage() {
  const { user } = useAuth()
  const { data: properties, loading: loadingProperties, error, reload } = useAsync(
    () => propertiesService.getByOwner(user!.id),
    [user?.id],
  )
  const { data: enquiries, loading: loadingEnquiries } = useAsync(() => enquiriesService.getByOwner(user!.id), [user?.id])

  const loading = loadingProperties || loadingEnquiries

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

  const list = properties ?? []
  const published = list.filter((p) => p.listingStatus === 'published')
  const totalViews = list.reduce((sum, p) => sum + p.views, 0)
  const unreadEnquiries = (enquiries ?? []).filter((e) => !e.read)

  if (list.length === 0) {
    return (
      <EmptyState
        title="No properties yet"
        description="Add your first property to start receiving enquiries from tenants."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total properties" value={list.length} icon={Building2} />
        <StatCard label="Published" value={published.length} icon={Eye} />
        <StatCard label="Views (est.)" value={totalViews} icon={Eye} />
        <StatCard label="Enquiries" value={(enquiries ?? []).length} icon={Inbox} trend={{ value: unreadEnquiries.length, label: 'unread' }} />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-navy-900 dark:text-white">Views over time</h2>
            <p className="text-sm text-slate-500">Estimated across all your listings</p>
          </div>
          <MessageSquare className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <div className="mt-6 h-56">
          <LineChart data={buildWeeklyTrend(totalViews)} />
        </div>
      </Card>
    </div>
  )
}
