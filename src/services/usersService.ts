import { users as seedUsers } from '../data/users'
import type { User } from '../types'
import { generateId } from '../utils/id'
import { STORAGE_KEYS, storage } from '../utils/storage'
import { withDelay } from './delay'

/** The fields people edit about themselves on the profile page. */
export type ProfilePatch = Partial<Pick<User, 'name' | 'email' | 'phone' | 'city' | 'avatar' | 'bio' | 'whatsapp'>>

// The rest of the mock data resets on reload, but someone's own profile edits should not —
// they are kept per user in localStorage and re-applied on top of the seed data.
function loadProfileEdits() {
  return storage.get<Record<string, ProfilePatch>>(STORAGE_KEYS.profiles) ?? {}
}

const profileEdits = loadProfileEdits()
let store: User[] = seedUsers.map((u) => (profileEdits[u.id] ? { ...u, ...profileEdits[u.id] } : u))

export type NewOwner = Pick<User, 'name' | 'email' | 'phone' | 'city' | 'nationalId' | 'status'>

export const usersService = {
  list(): Promise<User[]> {
    return withDelay(() => [...store])
  },

  getById(id: string): Promise<User | undefined> {
    return withDelay(() => store.find((u) => u.id === id))
  },

  getOwners(): Promise<User[]> {
    return withDelay(() => store.filter((u) => u.role === 'owner'))
  },

  getGuests(): Promise<User[]> {
    return withDelay(() => store.filter((u) => u.role === 'guest'))
  },

  findByEmail(email: string): Promise<User | undefined> {
    return withDelay(() => store.find((u) => u.email.toLowerCase() === email.toLowerCase()))
  },

  registerGuest(input: Pick<User, 'name' | 'email' | 'phone'>): Promise<User> {
    const created: User = {
      ...input,
      id: generateId('guest'),
      role: 'guest',
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    return withDelay(() => created)
  },

  addOwner(input: NewOwner): Promise<User> {
    const created: User = {
      ...input,
      id: generateId('owner'),
      role: 'owner',
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    return withDelay(() => created)
  },

  /**
   * Saves the signed-in user's own profile. `current` is the session copy, used when the
   * account is not in the in-memory store (e.g. one registered before the last reload).
   */
  async updateProfile(current: User, patch: ProfilePatch): Promise<User> {
    if (patch.email) {
      const taken = store.find((u) => u.id !== current.id && u.email.toLowerCase() === patch.email!.toLowerCase())
      if (taken) throw new Error('Another account already uses that email address.')
    }
    const existing = store.find((u) => u.id === current.id)
    const updated: User = { ...(existing ?? current), ...patch }
    store = existing ? store.map((u) => (u.id === current.id ? updated : u)) : [updated, ...store]

    const edits = loadProfileEdits()
    edits[current.id] = { ...edits[current.id], ...patch }
    storage.set(STORAGE_KEYS.profiles, edits)
    return withDelay(() => updated)
  },

  update(id: string, patch: Partial<User>): Promise<User | undefined> {
    store = store.map((u) => (u.id === id ? { ...u, ...patch } : u))
    return withDelay(() => store.find((u) => u.id === id))
  },

  remove(id: string): Promise<void> {
    store = store.filter((u) => u.id !== id)
    return withDelay(() => undefined)
  },
}
