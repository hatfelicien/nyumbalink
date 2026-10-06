import { z } from 'zod'
import { KIGALI_CENTER } from '../../../utils/constants'

export const wizardSchema = z.object({
  title: z.string().min(5, 'Title should be at least 5 characters'),
  type: z.enum(['apartment', 'bungalow', 'studio', 'villa', 'shared room']),
  purpose: z.enum(['rent', 'sale']),
  description: z.string().min(20, 'Add a longer description (20+ characters)'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  negotiable: z.boolean(),
  cautionMoney: z.coerce.number().min(0, 'Cannot be negative'),
  bedrooms: z.coerce.number().min(0, 'Cannot be negative'),
  bathrooms: z.coerce.number().min(0, 'Cannot be negative'),
  sizeSqm: z.coerce.number().positive('Size must be greater than 0'),
  furnished: z.boolean(),
  amenities: z.array(z.string()),
  address: z.string().min(3, 'Enter an address'),
  coordinates: z.object({ lat: z.number(), lng: z.number() }),
  locationPrecision: z.enum(['exact', 'approximate']),
  monthlyCosts: z.object({
    water: z.coerce.number().min(0, 'Cannot be negative'),
    electricity: z.coerce.number().min(0, 'Cannot be negative'),
    internet: z.coerce.number().min(0, 'Cannot be negative'),
    security: z.coerce.number().min(0, 'Cannot be negative'),
    garbage: z.coerce.number().min(0, 'Cannot be negative'),
  }),
  videoUrl: z.union([z.literal(''), z.string().url('Enter a full link, starting with https://')]),
  images: z.array(z.object({ url: z.string(), isCover: z.boolean() })).min(1, 'Add at least one photo'),
})

export type WizardValues = z.infer<typeof wizardSchema>

export const WIZARD_STEPS = [
  { title: 'Basics' },
  { title: 'Details' },
  { title: 'Location' },
  { title: 'Photos' },
  { title: 'Review' },
]

export const STEP_FIELDS: (keyof WizardValues)[][] = [
  ['title', 'type', 'purpose', 'description'],
  ['price', 'negotiable', 'cautionMoney', 'bedrooms', 'bathrooms', 'sizeSqm', 'furnished', 'amenities', 'monthlyCosts'],
  ['address', 'coordinates', 'locationPrecision'],
  ['images', 'videoUrl'],
  [],
]

export const DEFAULT_WIZARD_VALUES: WizardValues = {
  title: '',
  type: 'apartment',
  purpose: 'rent',
  description: '',
  price: 0,
  negotiable: false,
  cautionMoney: 0,
  bedrooms: 1,
  bathrooms: 1,
  sizeSqm: 0,
  furnished: false,
  amenities: [],
  address: '',
  coordinates: { lat: KIGALI_CENTER[0], lng: KIGALI_CENTER[1] },
  locationPrecision: 'exact',
  monthlyCosts: { water: 0, electricity: 0, internet: 0, security: 0, garbage: 0 },
  videoUrl: '',
  images: [],
}
