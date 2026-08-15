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
  createdAt: string
}

export type PropertyType = 'apartment' | 'bungalow' | 'studio' | 'villa' | 'shared room'
export type PropertyStatus = 'available' | 'reserved' | 'rented'
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
  bedrooms: number
  bathrooms: number
  sizeSqm: number
  furnished: boolean
  amenities: Amenity[]
  status: PropertyStatus
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
  furnished: boolean | null
  amenities: Amenity[]
  status: PropertyStatus | null
  sort: 'newest' | 'price-asc' | 'price-desc' | 'rating'
}
