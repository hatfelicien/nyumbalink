import { z } from 'zod'
import { KIGALI_CENTER } from '../../../utils/constants'

export const wizardSchema = z.object({
  title: z.string().min(5, 'Title should be at least 5 characters'),
  type: z.enum(['apartment', 'bungalow', 'studio', 'villa', 'shared room']),
  description: z.string().min(20, 'Add a longer description (20+ characters)'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  bedrooms: z.coerce.number().min(0, 'Cannot be negative'),
  bathrooms: z.coerce.number().min(0, 'Cannot be negative'),
  sizeSqm: z.coerce.number().positive('Size must be greater than 0'),
  furnished: z.boolean(),
  amenities: z.array(z.string()),
  address: z.string().min(3, 'Enter an address'),
  coordinates: z.object({ lat: z.number(), lng: z.number() }),
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
  ['title', 'type', 'description'],
  ['price', 'bedrooms', 'bathrooms', 'sizeSqm', 'furnished', 'amenities'],
  ['address', 'coordinates'],
  ['images'],
  [],
]

export const DEFAULT_WIZARD_VALUES: WizardValues = {
  title: '',
  type: 'apartment',
  description: '',
  price: 0,
  bedrooms: 1,
  bathrooms: 1,
  sizeSqm: 0,
  furnished: false,
  amenities: [],
  address: '',
  coordinates: { lat: KIGALI_CENTER[0], lng: KIGALI_CENTER[1] },
  images: [],
}
