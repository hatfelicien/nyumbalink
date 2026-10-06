import { disputes as seedDisputes, reports as seedReports } from '../data/rentals'
import type { Dispute, DisputeStatus, Property, Report, ReportStatus, User } from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'
import { ADMIN_AUDIENCE, notify } from './notificationsService'
import { propertiesService } from './propertiesService'
import { usersService } from './usersService'

let reportStore: Report[] = [...seedReports]
let disputeStore: Dispute[] = [...seedDisputes]

/** Open reports from this many different people hide a listing until an admin has looked at it. */
export const AUTO_FLAG_THRESHOLD = 3

export interface ReportDetails extends Report {
  property: Property | undefined
  owner: User | undefined
  reporter: User | undefined
  /** Open reports against the same listing, including this one. */
  openCount: number
}

export interface DisputeDetails extends Dispute {
  property: Property | undefined
  raisedBy: User | undefined
  against: User | undefined
}

function newestFirst<T extends { createdAt: string }>(records: T[]) {
  return [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export type NewReport = Pick<Report, 'propertyId' | 'reporterId' | 'reason' | 'details'>

export const reportsService = {
  async list(): Promise<ReportDetails[]> {
    const [users, properties] = await Promise.all([usersService.list(), propertiesService.list()])
    return newestFirst(reportStore).map((report) => {
      const property = properties.find((p) => p.id === report.propertyId)
      return {
        ...report,
        property,
        owner: users.find((u) => u.id === property?.ownerId),
        reporter: users.find((u) => u.id === report.reporterId),
        openCount: reportStore.filter((r) => r.propertyId === report.propertyId && r.status === 'open').length,
      }
    })
  },

  listAll(): Promise<Report[]> {
    return withDelay(() => [...reportStore])
  },

  /** Whether this person already has an open report on the listing — one each, so a single account cannot trip the auto-flag. */
  hasOpenReport(propertyId: string, reporterId: string): Promise<boolean> {
    return withDelay(() => reportStore.some((r) => r.propertyId === propertyId && r.reporterId === reporterId && r.status === 'open'))
  },

  async create(input: NewReport): Promise<{ report: Report; autoFlagged: boolean }> {
    const report: Report = { ...input, id: generateId('report'), status: 'open', createdAt: new Date().toISOString() }
    reportStore = [report, ...reportStore]

    const reporters = new Set(
      reportStore.filter((r) => r.propertyId === input.propertyId && r.status === 'open').map((r) => r.reporterId ?? r.id),
    )
    const autoFlagged = reporters.size >= AUTO_FLAG_THRESHOLD
    if (autoFlagged) await propertiesService.update(input.propertyId, { listingStatus: 'flagged' })

    notify(ADMIN_AUDIENCE, {
      title: autoFlagged ? 'Listing hidden after repeated reports' : 'Listing reported',
      body: autoFlagged
        ? `${reporters.size} people reported the same listing. It is hidden until reviewed.`
        : 'A listing was reported and is waiting for review.',
      href: '/admin/reports',
      channels: ['in_app'],
    })
    return { report, autoFlagged }
  },

  resolve(id: string, status: Exclude<ReportStatus, 'open'>, resolution: string): Promise<void> {
    reportStore = reportStore.map((r) => (r.id === id ? { ...r, status, resolution } : r))
    return withDelay(() => undefined)
  },
}

export type NewDispute = Omit<Dispute, 'id' | 'status' | 'resolution' | 'createdAt'>

export const disputesService = {
  async list(): Promise<DisputeDetails[]> {
    const [users, properties] = await Promise.all([usersService.list(), propertiesService.list()])
    return newestFirst(disputeStore).map((dispute) => ({
      ...dispute,
      property: properties.find((p) => p.id === dispute.propertyId),
      raisedBy: users.find((u) => u.id === dispute.raisedById),
      against: users.find((u) => u.id === dispute.againstId),
    }))
  },

  getByAgreement(agreementId: string): Promise<Dispute[]> {
    return withDelay(() => newestFirst(disputeStore.filter((d) => d.agreementId === agreementId)))
  },

  create(input: NewDispute): Promise<Dispute> {
    const dispute: Dispute = { ...input, id: generateId('dispute'), status: 'open', createdAt: new Date().toISOString() }
    disputeStore = [dispute, ...disputeStore]
    notify(ADMIN_AUDIENCE, {
      title: 'Dispute opened',
      body: 'A tenant or landlord asked NyumbaLink to mediate.',
      href: '/admin/reports?tab=disputes',
      channels: ['in_app'],
    })
    notify(input.againstId, {
      title: 'A dispute was opened',
      body: 'The other party asked NyumbaLink to mediate. An admin will contact you both.',
      href: `/agreements/${input.agreementId}`,
    })
    return withDelay(() => dispute)
  },

  update(id: string, status: DisputeStatus, resolution?: string): Promise<void> {
    disputeStore = disputeStore.map((d) => (d.id === id ? { ...d, status, resolution: resolution || d.resolution } : d))
    const dispute = disputeStore.find((d) => d.id === id)
    if (dispute && status === 'resolved') {
      for (const userId of [dispute.raisedById, dispute.againstId]) {
        notify(userId, {
          title: 'Dispute resolved',
          body: resolution || 'An admin closed the dispute.',
          href: `/agreements/${dispute.agreementId}`,
        })
      }
    }
    return withDelay(() => undefined)
  },
}
