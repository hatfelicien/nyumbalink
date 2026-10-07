import { users as seedUsers } from '../data/users'
import type { User } from '../types'
import { generateId } from '../utils/id'
import { STORAGE_KEYS, storage } from '../utils/storage'
import { credentials } from './credentials'
import { withDelay } from './delay'

/** The fields people edit about themselves on the profile page. */
export type ProfilePatch = Partial<Pick<User, 'name' | 'email' | 'phone' | 'city' | 'avatar' | 'bio' | 'whatsapp'>>

/*
 * The seeded demo data resets on every reload, but two things must not: accounts people
 * register in this browser (a landlord who applies has to still exist when an admin
 * approves them later), and the edits people make to their own profile. Both live in
 * localStorage and are layered on top of the seed users here.
 */
function loadProfileEdits() {
  return storage.get<Record<string, ProfilePatch>>(STORAGE_KEYS.profiles) ?? {}
}

function loadRegisteredUsers() {
  return storage.get<User[]>(STORAGE_KEYS.registeredUsers) ?? []
}

function persistIfRegistered(user: User | undefined) {
  if (!user) return
  const registered = loadRegisteredUsers()
  if (!registered.some((u) => u.id === user.id)) return
  storage.set(
    STORAGE_KEYS.registeredUsers,
    registered.map((u) => (u.id === user.id ? user : u)),
  )
}

function addRegistered(user: User) {
  storage.set(STORAGE_KEYS.registeredUsers, [user, ...loadRegisteredUsers()])
}

const profileEdits = loadProfileEdits()
let store: User[] = [...loadRegisteredUsers(), ...seedUsers].map((u) =>
  profileEdits[u.id] ? { ...u, ...profileEdits[u.id] } : u,
)

function emailTaken(email: string, exceptId?: string) {
  return store.some((u) => u.id !== exceptId && u.email.toLowerCase() === email.trim().toLowerCase())
}

export type NewOwner = Pick<User, 'name' | 'email' | 'phone' | 'city' | 'nationalId' | 'status'>

export interface RegistrationInput {
  name: string
  email: string
  phone: string
  password: string
  city?: string
  nationalId?: string
}

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
    return withDelay(() => store.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
  },

  isEmailTaken(email: string): Promise<boolean> {
    return withDelay(() => emailTaken(email), 150, 300)
  },

  /** Tenants can use their account straight away. */
  registerGuest(input: RegistrationInput): Promise<User> {
    return usersService.createAccount(input, 'guest', 'active')
  },

  /** Landlord accounts start out pending and cannot log in until an admin approves the application. */
  registerOwner(input: RegistrationInput): Promise<User> {
    return usersService.createAccount(input, 'owner', 'pending')
  },

  createAccount(input: RegistrationInput, role: 'guest' | 'owner', status: User['status']): Promise<User> {
    if (emailTaken(input.email)) return Promise.reject(new Error('An account with that email already exists.'))
    const created: User = {
      id: generateId(role),
      role,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone,
      city: input.city,
      nationalId: input.nationalId,
      status,
      ...(role === 'owner' ? { verification: 'unverified' as const } : {}),
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    addRegistered(created)
    credentials.set(created.id, input.password)
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
   * account is not in the in-memory store.
   */
  async updateProfile(current: User, patch: ProfilePatch): Promise<User> {
    if (patch.email && emailTaken(patch.email, current.id)) {
      throw new Error('Another account already uses that email address.')
    }
    const existing = store.find((u) => u.id === current.id)
    const updated: User = { ...(existing ?? current), ...patch }
    store = existing ? store.map((u) => (u.id === current.id ? updated : u)) : [updated, ...store]

    const edits = loadProfileEdits()
    edits[current.id] = { ...edits[current.id], ...patch }
    storage.set(STORAGE_KEYS.profiles, edits)
    persistIfRegistered(updated)
    return withDelay(() => updated)
  },

  /** Checks the current password (demo accounts have none, so any is accepted), then saves the new one. */
  changePassword(userId: string, current: string, next: string): Promise<void> {
    if (!credentials.check(userId, current)) return Promise.reject(new Error('Your current password is not correct.'))
    credentials.set(userId, next)
    return withDelay(() => undefined)
  },

  update(id: string, patch: Partial<User>): Promise<User | undefined> {
    store = store.map((u) => (u.id === id ? { ...u, ...patch } : u))
    const updated = store.find((u) => u.id === id)
    persistIfRegistered(updated)
    return withDelay(() => updated)
  },

  remove(id: string): Promise<void> {
    store = store.filter((u) => u.id !== id)
    storage.set(
      STORAGE_KEYS.registeredUsers,
      loadRegisteredUsers().filter((u) => u.id !== id),
    )
    return withDelay(() => undefined)
  },
}
