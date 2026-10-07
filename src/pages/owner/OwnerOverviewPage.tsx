import { Link } from 'react-router-dom'
import { BadgeCheck, Building2, CalendarDays, Eye, FileText, Inbox, MessageSquare, Wrench } from 'lucide-react'
import { LineChart } from '../../components/dashboard/LineChart'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { enquiriesService } from '../../services/enquiriesService'
import { propertiesService } from '../../services/propertiesService'
import { maintenanceService, rentalApplicationsService, viewingsService } from '../../services/rentalsService'
import { buildWeeklyTrend } from '../../utils/mockSeries'

export function OwnerOverviewPage() {
  const { user } = useAuth()
  const { data: properties, loading: loadingProperties, error, reload } = useAsync(
    () => propertiesService.getByOwner(user!.id),
    [user?.id],
  )
  const { data: enquiries, loading: loadingEnquiries } = useAsync(() => enquiriesService.getByOwner(user!.id), [user?.id])

  const { data: work } = useAsync(() => {
    const party = { role: 'owner' as const, userId: user!.id }
    return Promise.all([viewingsService.list(party), rentalApplicationsService.list(party), maintenanceService.list(party)])
  }, [user?.id])

  const loading = loadingProperties || loadingEnquiries

  if (error) return <ErrorState onRetry={reload} />

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
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
        icon={Building2}
        title={`Welcome, ${user!.name.split(' ')[0]}`}
        description="Your landlord account is active. Add your first property, then verify your identity and ownership so tenants see the verified badges."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/owner/properties/new">
              <Button className="w-full">Add your first property</Button>
            </Link>
            <Link to="/owner/verification">
              <Button variant="secondary" className="w-full">
                Verify your identity
              </Button>
            </Link>
          </div>
        }
      />
    )
  }

  const [viewings, applications, maintenance] = work ?? [[], [], []]
  const unverified = list.filter((p) => p.verification === 'unverified' || p.verification === 'rejected').length
  const todo = [
    { one: 'listing to verify', many: 'listings to verify', value: unverified, to: '/owner/verification', icon: BadgeCheck },
    { one: 'viewing request', many: 'viewing requests', value: viewings.filter((v) => v.status === 'requested').length, to: '/owner/viewings', icon: CalendarDays },
    { one: 'application to review', many: 'applications to review', value: applications.filter((a) => a.status === 'submitted').length, to: '/owner/applications', icon: FileText },
    { one: 'open repair', many: 'open repairs', value: maintenance.filter((m) => m.status !== 'resolved').length, to: '/owner/maintenance', icon: Wrench },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {todo.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {todo.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-500/15 active:scale-95 dark:text-amber-300"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.value} {item.value === 1 ? item.one : item.many}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <StatCard label="Total properties" value={list.length} icon={Building2} />
        <StatCard label="Published" value={published.length} icon={Eye} />
        <StatCard label="Views (est.)" value={totalViews} icon={Eye} />
        <StatCard label="Enquiries" value={(enquiries ?? []).length} icon={Inbox} hint={unreadEnquiries.length > 0 ? `${unreadEnquiries.length} unread` : 'All read'} />
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
