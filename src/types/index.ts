export type Role = 'admin' | 'owner' | 'guest'

export interface User {
  id: string
  role: Role
  name: string
  email: string
  phone?: string
  avatar?: string
  city?: string
  nationalId?: string
  status: 'active' | 'suspended' | 'pending'
  /** Owner has proven identity (national ID / property document) to an admin. Guests and admins leave this unset. */
  verified?: boolean
  createdAt: string
}

export type PropertyType = 'apartment' | 'bungalow' | 'studio' | 'villa' | 'shared room'
export type ListingPurpose = 'rent' | 'sale'
export type PropertyStatus = 'available' | 'reserved' | 'rented' | 'sold'
export type ListingStatus = 'draft' | 'pending' | 'published' | 'flagged'

export type Amenity =
  | 'wifi'
  | 'parking'
  | 'water tank'
  | 'security'
  | 'generator'
  | 'garden'
  | 'ac'

export interface Coordinates {
  lat: number
  lng: number
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  type: PropertyType
  /** Whether this listing is for rent (monthly `price`) or for sale (one-off `price`). */
  purpose: ListingPurpose
  /** Whether the owner is open to negotiating `price`. */
  negotiable: boolean
  /** Refundable deposit in RWF, collected before move-in. Rent listings only; 0 for sale listings. */
  cautionMoney: number
  bedrooms: number
  bathrooms: number
  sizeSqm: number
  furnished: boolean
  amenities: Amenity[]
  status: PropertyStatus
  /** ISO date. Set when `status` is not 'available', to tell guests when it's expected to free up again. */
  availableFrom?: string
  listingStatus: ListingStatus
  images: string[]
  address: string
  city: string
  district: string
  coordinates: Coordinates
  ownerId: string
  rating: number
  reviewCount: number
  views: number
  createdAt: string
}

export interface Enquiry {
  id: string
  propertyId: string
  ownerId: string
  name: string
  email: string
  phone: string
  message: string
  read: boolean
  createdAt: string
}

export interface Review {
  id: string
  propertyId: string
  authorName: string
  rating: number
  comment: string
  createdAt: string
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface OwnerApplication {
  id: string
  name: string
  email: string
  phone: string
  city: string
  message: string
  status: ApplicationStatus
  createdAt: string
}

export interface FilterState {
  location: string
  priceMin: number
  priceMax: number
  bedrooms: number | null
  bathrooms: number | null
  type: PropertyType | null
  purpose: ListingPurpose | null
  furnished: boolean | null
  amenities: Amenity[]
  status: PropertyStatus | null
  sort: 'newest' | 'price-asc' | 'price-desc' | 'rating'
}

export interface ChatThread {
  id: string
  propertyId: string
  guestId: string
  ownerId: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  text: string
  read: boolean
  createdAt: string
}

export type PaymentMethod = 'mtn_momo' | 'airtel_money'
export type PaymentPurpose = 'caution' | 'reservation'
export type PaymentStatus = 'pending' | 'success' | 'failed'

export interface Payment {
  id: string
  propertyId: string
  guestId: string
  method: PaymentMethod
  phone: string
  amount: number
  purpose: PaymentPurpose
  status: PaymentStatus
  reference: string
  createdAt: string
}
