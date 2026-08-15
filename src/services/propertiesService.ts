import { properties as seedProperties } from '../data/properties'
import type { Property } from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'

// In-memory store seeded from mock data. Mutations only persist for the
// current session — there is no backend yet, see README for the API note.
let store: Property[] = [...seedProperties]

export type NewProperty = Omit<Property, 'id' | 'views' | 'rating' | 'reviewCount' | 'createdAt'>

export const propertiesService = {
  list(): Promise<Property[]> {
    return withDelay(() => [...store])
  },

  getById(id: string): Promise<Property | undefined> {
    return withDelay(() => store.find((p) => p.id === id))
  },

  getByOwner(ownerId: string): Promise<Property[]> {
    return withDelay(() => store.filter((p) => p.ownerId === ownerId))
  },

  getSimilar(property: Property, limit = 4): Promise<Property[]> {
    return withDelay(() =>
      store
        .filter((p) => p.id !== property.id && (p.district === property.district || p.type === property.type))
        .slice(0, limit),
    )
  },

  create(input: NewProperty): Promise<Property> {
    const created: Property = {
      ...input,
      id: generateId('property'),
      views: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    return withDelay(() => created)
  },

  update(id: string, patch: Partial<Property>): Promise<Property | undefined> {
    store = store.map((p) => (p.id === id ? { ...p, ...patch } : p))
    return withDelay(() => store.find((p) => p.id === id))
  },

  remove(id: string): Promise<void> {
    store = store.filter((p) => p.id !== id)
    return withDelay(() => undefined)
  },
}
