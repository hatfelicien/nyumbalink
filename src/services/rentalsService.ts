import {
  agreements as seedAgreements,
  maintenanceRequests as seedMaintenance,
  rentalApplications as seedApplications,
  STANDARD_TERMS,
  viewings as seedViewings,
} from '../data/rentals'
import type {
  Agreement,
  MaintenanceRequest,
  MaintenanceStatus,
  Property,
  RentalApplication,
  User,
  Viewing,
  ViewingStatus,
} from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'
import { notify } from './notificationsService'
import { propertiesService } from './propertiesService'
import { usersService } from './usersService'

let viewingStore: Viewing[] = [...seedViewings]
let applicationStore: RentalApplication[] = [...seedApplications]
let agreementStore: Agreement[] = [...seedAgreements]
let maintenanceStore: MaintenanceRequest[] = [...seedMaintenance]

/** A record joined with the listing and both parties, which is what every screen needs to render it. */
export type WithParties<T> = T & { property: Property | undefined; tenant: User | undefined; owner: User | undefined }

interface PartyRefs {
  propertyId: string
  tenantId: string
  ownerId: string
}

async function withParties<T extends PartyRefs>(records: T[]): Promise<WithParties<T>[]> {
  const [users, properties] = await Promise.all([usersService.list(), propertiesService.list()])
  return records.map((record) => ({
    ...record,
    property: properties.find((p) => p.id === record.propertyId),
    tenant: users.find((u) => u.id === record.tenantId),
    owner: users.find((u) => u.id === record.ownerId),
  }))
}

type Party = { role: 'tenant' | 'owner'; userId: string }

function forParty<T extends PartyRefs>(records: T[], party: Party) {
  return records.filter((r) => (party.role === 'tenant' ? r.tenantId : r.ownerId) === party.userId)
}

function newestFirst<T extends { createdAt: string }>(records: T[]) {
  return [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export type NewViewing = Pick<Viewing, 'propertyId' | 'tenantId' | 'ownerId' | 'scheduledAt' | 'note'>

export const viewingsService = {
  list(party: Party): Promise<WithParties<Viewing>[]> {
    const records = forParty(viewingStore, party).sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    return withParties(records)
  },

  listAll(): Promise<Viewing[]> {
    return withDelay(() => [...viewingStore])
  },

  request(input: NewViewing): Promise<Viewing> {
    const created: Viewing = { ...input, id: generateId('viewing'), status: 'requested', createdAt: new Date().toISOString() }
    viewingStore = [created, ...viewingStore]
    notify(input.ownerId, {
      title: 'New viewing request',
      body: `A tenant asked to visit on ${formatWhen(input.scheduledAt)}.`,
      href: '/owner/viewings',
    })
    return withDelay(() => created)
  },

  setStatus(id: string, status: ViewingStatus, actor: 'tenant' | 'owner'): Promise<Viewing | undefined> {
    viewingStore = viewingStore.map((v) => (v.id === id ? { ...v, status } : v))
    const viewing = viewingStore.find((v) => v.id === id)
    if (viewing) {
      const recipient = actor === 'owner' ? viewing.tenantId : viewing.ownerId
      notify(recipient, {
        title: `Viewing ${status}`,
        body: `The visit on ${formatWhen(viewing.scheduledAt)} is now ${status}.`,
        href: actor === 'owner' ? '/account?tab=viewings' : '/owner/viewings',
      })
    }
    return withDelay(() => viewing)
  },
}

export type NewRentalApplication = Omit<RentalApplication, 'id' | 'status' | 'createdAt'>

export const rentalApplicationsService = {
  list(party: Party): Promise<WithParties<RentalApplication>[]> {
    return withParties(newestFirst(forParty(applicationStore, party)))
  },

  listAll(): Promise<RentalApplication[]> {
    return withDelay(() => [...applicationStore])
  },

  /** A tenant can only have one live application per listing. */
  findOpen(propertyId: string, tenantId: string): Promise<RentalApplication | undefined> {
    return withDelay(() =>
      applicationStore.find(
        (a) => a.propertyId === propertyId && a.tenantId === tenantId && (a.status === 'submitted' || a.status === 'approved'),
      ),
    )
  },

  submit(input: NewRentalApplication): Promise<RentalApplication> {
    const created: RentalApplication = {
      ...input,
      id: generateId('rental-application'),
      status: 'submitted',
      createdAt: new Date().toISOString(),
    }
    applicationStore = [created, ...applicationStore]
    notify(input.ownerId, {
      title: 'New rental application',
      body: 'A tenant applied to rent one of your listings.',
      href: '/owner/applications',
    })
    return withDelay(() => created)
  },

  withdraw(id: string): Promise<void> {
    applicationStore = applicationStore.map((a) => (a.id === id ? { ...a, status: 'withdrawn' } : a))
    return withDelay(() => undefined)
  },

  reject(id: string): Promise<void> {
    applicationStore = applicationStore.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
    const application = applicationStore.find((a) => a.id === id)
    if (application) {
      notify(application.tenantId, {
        title: 'Application not accepted',
        body: 'The landlord chose not to go ahead with your application.',
        href: '/account?tab=applications',
      })
    }
    return withDelay(() => undefined)
  },

  /** Approving an application drafts the rental agreement for the landlord to sign first. */
  async approve(id: string): Promise<Agreement | undefined> {
    const application = applicationStore.find((a) => a.id === id)
    if (!application) return undefined
    applicationStore = applicationStore.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))

    const property = await propertiesService.getById(application.propertyId)
    // Date-only strings parse as UTC midnight, so the arithmetic stays in UTC to avoid drifting a day by time zone.
    const end = new Date(application.moveInDate)
    end.setUTCMonth(end.getUTCMonth() + application.leaseMonths)
    end.setUTCDate(end.getUTCDate() - 1)

    const agreement: Agreement = {
      id: generateId('agreement'),
      applicationId: application.id,
      propertyId: application.propertyId,
      tenantId: application.tenantId,
      ownerId: application.ownerId,
      monthlyRent: property?.price ?? 0,
      deposit: property?.cautionMoney ?? 0,
      startDate: application.moveInDate,
      endDate: end.toISOString().slice(0, 10),
      noticeDays: 30,
      terms: STANDARD_TERMS,
      status: 'awaiting_owner',
      createdAt: new Date().toISOString(),
    }
    agreementStore = [agreement, ...agreementStore]
    notify(application.tenantId, {
      title: 'Application approved',
      body: 'The landlord is preparing your rental agreement.',
      href: '/account?tab=applications',
    })
    return agreement
  },
}

export const agreementsService = {
  list(party: Party): Promise<WithParties<Agreement>[]> {
    return withParties(newestFirst(forParty(agreementStore, party)))
  },

  listAll(): Promise<Agreement[]> {
    return withDelay(() => [...agreementStore])
  },

  async getById(id: string): Promise<WithParties<Agreement> | undefined> {
    const agreement = agreementStore.find((a) => a.id === id)
    if (!agreement) return withDelay(() => undefined)
    return (await withParties([agreement]))[0]
  },

  /** Agreements the tenant can raise repairs against. */
  listActiveForTenant(tenantId: string): Promise<WithParties<Agreement>[]> {
    return withParties(agreementStore.filter((a) => a.tenantId === tenantId && a.status === 'active'))
  },

  /**
   * The landlord signs first, then the tenant. The tenant's signature makes the
   * agreement active and takes the listing off the market until the lease ends.
   */
  async sign(id: string, signer: 'owner' | 'tenant', name: string): Promise<Agreement | undefined> {
    const agreement = agreementStore.find((a) => a.id === id)
    if (!agreement) return undefined
    const signature = { name, signedAt: new Date().toISOString() }

    const updated: Agreement =
      signer === 'owner'
        ? { ...agreement, ownerSignature: signature, status: 'awaiting_tenant' }
        : { ...agreement, tenantSignature: signature, status: 'active' }
    agreementStore = agreementStore.map((a) => (a.id === id ? updated : a))

    if (signer === 'owner') {
      notify(agreement.tenantId, {
        title: 'Agreement ready to sign',
        body: 'Your landlord signed the rental agreement. Review and sign it to confirm the tenancy.',
        href: `/agreements/${id}`,
      })
    } else {
      await propertiesService.update(agreement.propertyId, {
        status: 'rented',
        availableFrom: new Date(agreement.endDate).toISOString(),
      })
      notify(agreement.ownerId, {
        title: 'Agreement signed',
        body: `${name} signed the rental agreement. The listing is now marked as rented.`,
        href: `/agreements/${id}`,
      })
    }
    return updated
  },

  cancel(id: string): Promise<void> {
    agreementStore = agreementStore.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    return withDelay(() => undefined)
  },
}

export type NewMaintenanceRequest = Omit<MaintenanceRequest, 'id' | 'status' | 'ownerNote' | 'createdAt' | 'updatedAt'>

export const maintenanceService = {
  list(party: Party): Promise<WithParties<MaintenanceRequest>[]> {
    return withParties(newestFirst(forParty(maintenanceStore, party)))
  },

  listAll(): Promise<MaintenanceRequest[]> {
    return withDelay(() => [...maintenanceStore])
  },

  create(input: NewMaintenanceRequest): Promise<MaintenanceRequest> {
    const now = new Date().toISOString()
    const created: MaintenanceRequest = { ...input, id: generateId('maintenance'), status: 'open', createdAt: now, updatedAt: now }
    maintenanceStore = [created, ...maintenanceStore]
    notify(input.ownerId, {
      title: input.urgency === 'urgent' ? 'Urgent repair reported' : 'Repair reported',
      body: input.title,
      href: '/owner/maintenance',
    })
    return withDelay(() => created)
  },

  update(id: string, status: MaintenanceStatus, ownerNote?: string): Promise<MaintenanceRequest | undefined> {
    maintenanceStore = maintenanceStore.map((m) =>
      m.id === id ? { ...m, status, ownerNote: ownerNote || m.ownerNote, updatedAt: new Date().toISOString() } : m,
    )
    const request = maintenanceStore.find((m) => m.id === id)
    if (request) {
      notify(request.tenantId, {
        title: status === 'resolved' ? 'Repair marked as resolved' : 'Repair update',
        body: ownerNote || `"${request.title}" is now ${status.replace('_', ' ')}.`,
        href: '/account?tab=maintenance',
      })
    }
    return withDelay(() => request)
  },
}
