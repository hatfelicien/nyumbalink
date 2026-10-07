import { applications as seedApplications } from '../data/applications'
import type { OwnerApplication } from '../types'
import { generateId } from '../utils/id'
import { STORAGE_KEYS, storage } from '../utils/storage'
import { withDelay } from './delay'
import { ADMIN_AUDIENCE, notify } from './notificationsService'
import { usersService } from './usersService'
import type { RegistrationInput } from './usersService'

// Applications are saved in this browser so a landlord's application is still waiting in
// the admin queue after a reload. Clearing site data brings back the seeded examples.
let store: OwnerApplication[] = storage.get<OwnerApplication[]>(STORAGE_KEYS.ownerApplications) ?? [...seedApplications]

function persist() {
  storage.set(STORAGE_KEYS.ownerApplications, store)
}

export type NewApplication = Omit<OwnerApplication, 'id' | 'status' | 'createdAt'>

export interface LandlordApplicationInput extends RegistrationInput {
  district: string
  propertyCount: string
  message: string
}

export const applicationsService = {
  list(): Promise<OwnerApplication[]> {
    return withDelay(() => [...store].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  },

  getByUser(userId: string): Promise<OwnerApplication | undefined> {
    return withDelay(() => store.find((a) => a.userId === userId), 100, 200)
  },

  create(input: NewApplication): Promise<OwnerApplication> {
    const created: OwnerApplication = {
      ...input,
      id: generateId('application'),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    persist()
    return withDelay(() => created)
  },

  /**
   * A landlord's sign-up: creates their account (locked as pending) together with the
   * application an admin reviews. Approving the application is what unlocks the account.
   */
  async apply(input: LandlordApplicationInput): Promise<OwnerApplication> {
    const user = await usersService.registerOwner(input)
    const application = await applicationsService.create({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: input.phone,
      city: input.city ?? 'Kigali',
      district: input.district,
      nationalId: input.nationalId,
      propertyCount: input.propertyCount,
      message: input.message,
    })
    notify(ADMIN_AUDIENCE, {
      title: 'New landlord application',
      body: `${user.name} applied for a landlord account.`,
      href: '/admin/applications',
      channels: ['in_app'],
    })
    return application
  },

  /** Approves or rejects, and unlocks or closes the linked landlord account to match. */
  async review(id: string, decision: 'approved' | 'rejected', reviewNote?: string): Promise<OwnerApplication | undefined> {
    const application = store.find((a) => a.id === id)
    if (!application) return undefined
    const updated: OwnerApplication = { ...application, status: decision, reviewNote, reviewedAt: new Date().toISOString() }
    store = store.map((a) => (a.id === id ? updated : a))
    persist()

    if (application.userId) {
      await usersService.update(application.userId, { status: decision === 'approved' ? 'active' : 'rejected' })
      notify(application.userId, {
        title: decision === 'approved' ? 'Your landlord account is approved' : 'Your landlord application was not approved',
        body:
          decision === 'approved'
            ? 'You can now log in, verify your identity and list your first property.'
            : (reviewNote ?? 'Contact us if you would like to know more.'),
        href: decision === 'approved' ? '/owner' : '/contact',
        channels: ['in_app', 'sms'],
      })
    } else if (decision === 'approved') {
      // Older applications were sent without an account, so approving creates one.
      await usersService.addOwner({
        name: application.name,
        email: application.email,
        phone: application.phone,
        city: application.city,
        nationalId: application.nationalId,
        status: 'active',
      })
    }
    return updated
  },
}
