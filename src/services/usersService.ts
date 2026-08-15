import { users as seedUsers } from '../data/users'
import type { User } from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'

let store: User[] = [...seedUsers]

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

  update(id: string, patch: Partial<User>): Promise<User | undefined> {
    store = store.map((u) => (u.id === id ? { ...u, ...patch } : u))
    return withDelay(() => store.find((u) => u.id === id))
  },

  remove(id: string): Promise<void> {
    store = store.filter((u) => u.id !== id)
    return withDelay(() => undefined)
  },
}
