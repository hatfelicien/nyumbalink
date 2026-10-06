import { Link } from 'react-router-dom'
import { BadgeCheck, Building2, ClipboardList, Flag, Scale, ShieldCheck, UserCog, Users } from 'lucide-react'
import { BarChart } from '../../components/dashboard/BarChart'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { useAsync } from '../../hooks/useAsync'
import { applicationsService } from '../../services/applicationsService'
import { propertiesService } from '../../services/propertiesService'
import { agreementsService, maintenanceService, rentalApplicationsService, viewingsService } from '../../services/rentalsService'
import { reviewsService } from '../../services/reviewsService'
import { disputesService, reportsService } from '../../services/trustService'
import { verificationService } from '../../services/verificationService'
import { usersService } from '../../services/usersService'
import { KIGALI_DISTRICTS } from '../../utils/constants'
import { buildMonthlyTrend } from '../../utils/mockSeries'
import { RecentActivityFeed } from '../../components/dashboard/RecentActivityFeed'

export function AdminOverviewPage() {
  const { data: properties, loading: loadingProperties, error, reload } = useAsync(() => propertiesService.list(), [])
  const { data: users, loading: loadingUsers } = useAsync(() => usersService.list(), [])
  const { data: applications, loading: loadingApplications } = useAsync(() => applicationsService.list(), [])

  const { data: trust, loading: loadingTrust } = useAsync(
    () =>
      Promise.all([
        verificationService.countPending(),
        reportsService.listAll(),
        disputesService.list(),
        reviewsService.listForModeration(),
        viewingsService.listAll(),
        rentalApplicationsService.listAll(),
        agreementsService.listAll(),
        maintenanceService.listAll(),
      ]),
    [],
  )

  const loading = loadingProperties || loadingUsers || loadingApplications || loadingTrust

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

  const owners = (users ?? []).filter((u) => u.role === 'owner')
  const guests = (users ?? []).filter((u) => u.role === 'guest')
  const pendingApplications = (applications ?? []).filter((a) => a.status === 'pending')
  const list = properties ?? []

  const [pendingVerifications, reports, disputes, reviews, viewings, rentalApplications, agreements, maintenance] = trust ?? [
    0,
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ]
  const published = list.filter((p) => p.listingStatus === 'published')
  const verifiedListings = published.filter((p) => p.verification === 'verified')
  const verifiedOwners = owners.filter((o) => o.verification === 'verified')
  const percent = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100))

  const queues = [
    { label: 'Verification requests', value: pendingVerifications, to: '/admin/verification', icon: BadgeCheck },
    { label: 'Open listing reports', value: reports.filter((r) => r.status === 'open').length, to: '/admin/reports', icon: Flag },
    { label: 'Open disputes', value: disputes.filter((d) => d.status !== 'resolved').length, to: '/admin/reports?tab=disputes', icon: Scale },
    { label: 'Reviews to moderate', value: reviews.filter((r) => r.status === 'pending').length, to: '/admin/reviews', icon: ShieldCheck },
  ]

  // One bar per stage of the rental journey, counting the records each stage produces.
  const journey = [
    { label: 'Find', value: published.length },
    { label: 'Verify', value: verifiedListings.length },
    { label: 'Visit', value: viewings.length },
    { label: 'Apply', value: rentalApplications.length },
    { label: 'Sign', value: agreements.filter((a) => a.tenantSignature).length },
    { label: 'Manage', value: maintenance.length },
  ]

  const perDistrict = KIGALI_DISTRICTS.map((district) => ({
    label: district,
    value: list.filter((p) => p.district.startsWith(district)).length,
  }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <StatCard label="Total listings" value={list.length} icon={Building2} />
        <StatCard label="Owners" value={owners.length} icon={UserCog} />
        <StatCard label="Guests" value={guests.length} icon={Users} />
        <StatCard label="Pending applications" value={pendingApplications.length} icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {queues.map((queue) => (
          <Link
            key={queue.label}
            to={queue.to}
            className="flex flex-col items-start gap-3 rounded-2xl border border-navy-700/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-soft dark:border-navy-700 dark:bg-navy-800 sm:flex-row sm:items-center"
          >
            <span
              className={
                queue.value > 0
                  ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900/5 text-slate-500 dark:bg-white/10'
              }
            >
              <queue.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xl font-semibold text-navy-900 dark:text-white">{queue.value}</span>
              <span className="block text-sm text-slate-500">{queue.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">Rental journey</h2>
          <p className="text-sm text-slate-500">Activity at each step, from published listings to repairs handled</p>
          <div className="mt-6">
            <BarChart data={journey} />
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-navy-900 dark:text-white">Trust coverage</h2>
          <p className="text-sm text-slate-500">Share of the marketplace that carries a verified badge</p>
          <div className="mt-6 space-y-5">
            {[
              { label: 'Published listings verified', part: verifiedListings.length, whole: published.length },
              { label: 'Landlords with verified ID', part: verifiedOwners.length, whole: owners.length },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-navy-900 dark:text-white">{row.label}</span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {percent(row.part, row.whole)}%{' '}
                    <span className="font-normal text-slate-500">
                      ({row.part} of {row.whole})
                    </span>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-900/5 dark:bg-white/10">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent(row.part, row.whole)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
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
