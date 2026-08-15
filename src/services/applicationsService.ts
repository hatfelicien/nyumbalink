import { applications as seedApplications } from '../data/applications'
import type { OwnerApplication } from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'

let store: OwnerApplication[] = [...seedApplications]

export type NewApplication = Omit<OwnerApplication, 'id' | 'status' | 'createdAt'>

export const applicationsService = {
  list(): Promise<OwnerApplication[]> {
    return withDelay(() => [...store])
  },

  create(input: NewApplication): Promise<OwnerApplication> {
    const created: OwnerApplication = {
      ...input,
      id: generateId('application'),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    return withDelay(() => created)
  },

  setStatus(id: string, status: OwnerApplication['status']): Promise<OwnerApplication | undefined> {
    store = store.map((a) => (a.id === id ? { ...a, status } : a))
    return withDelay(() => store.find((a) => a.id === id))
  },
}
