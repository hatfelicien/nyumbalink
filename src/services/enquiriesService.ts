import { enquiries as seedEnquiries } from '../data/enquiries'
import type { Enquiry } from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'

let store: Enquiry[] = [...seedEnquiries]

export type NewEnquiry = Omit<Enquiry, 'id' | 'read' | 'createdAt'>

export const enquiriesService = {
  getByOwner(ownerId: string): Promise<Enquiry[]> {
    return withDelay(() =>
      [...store]
        .filter((e) => e.ownerId === ownerId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    )
  },

  create(input: NewEnquiry): Promise<Enquiry> {
    const created: Enquiry = {
      ...input,
      id: generateId('enquiry'),
      read: false,
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    return withDelay(() => created)
  },

  markRead(id: string, read = true): Promise<Enquiry | undefined> {
    store = store.map((e) => (e.id === id ? { ...e, read } : e))
    return withDelay(() => store.find((e) => e.id === id))
  },
}
