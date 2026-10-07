export type Role = 'admin' | 'owner' | 'guest'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface User {
  id: string
  role: Role
  name: string
  email: string
  phone?: string
  /** Profile photo URL or data URL; an empty string means the user removed their photo. */
  avatar?: string
  city?: string
  /** Short introduction shown to tenants on the landlord card. */
  bio?: string
  /** WhatsApp number when it differs from `phone`. */
  whatsapp?: string
  nationalId?: string
  /** 'pending' landlords applied and are waiting for an admin; 'rejected' were turned down. Neither can log in. */
  status: 'active' | 'suspended' | 'pending' | 'rejected'
  /** Identity check (national ID / passport) reviewed by an admin. Owners only; guests and admins leave this unset. */
  verification?: VerificationStatus
  verifiedAt?: string
  createdAt: string
}

export type PropertyType = 'apartment' | 'bungalow' | 'studio' | 'villa' | 'shared room'
export type ListingPurpose = 'rent' | 'sale'
export type PropertyStatus = 'available' | 'reserved' | 'rented' | 'sold'
export type ListingStatus = 'draft' | 'pending' | 'published' | 'flagged'

export type Amenity =
  | 'piped water'
  | 'cash power'
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

/** Owner's estimate of the recurring monthly bills a tenant pays on top of rent, in RWF. */
export interface MonthlyCosts {
  water: number
  electricity: number
  internet: number
  /** Umutekano — the neighbourhood security fee collected per household. */
  security: number
  /** Isuku — the monthly garbage collection fee. */
  garbage: number
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
  /** Link to a walkthrough video (YouTube or a direct video file). */
  videoUrl?: string
  address: string
  city: string
  district: string
  coordinates: Coordinates
  /** 'approximate' hides the exact pin from the public until a viewing is confirmed. */
  locationPrecision: 'exact' | 'approximate'
  monthlyCosts: MonthlyCosts
  /** Ownership-document check reviewed by an admin. Drives the "Verified property" badge. */
  verification: VerificationStatus
  verifiedAt?: string
  /** Land title Unique Parcel Identifier, recorded once ownership is verified. */
  upi?: string
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

export type ReviewStatus = 'pending' | 'published' | 'rejected'

export interface Review {
  id: string
  propertyId: string
  authorId?: string
  authorName: string
  rating: number
  comment: string
  /** Only 'published' reviews are shown publicly; new reviews wait in the moderation queue. */
  status: ReviewStatus
  /** Author signed a rental agreement for this property on the platform. */
  verifiedTenant?: boolean
  /** Reasons the automatic screening raised, shown to moderators. */
  flags?: string[]
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
  /** The pending landlord account created with the application; approving it activates this account. */
  userId?: string
  nationalId?: string
  /** Kigali district (or other town) where the properties are. */
  district?: string
  propertyCount?: string
  /** Shown to the applicant when an application is rejected. */
  reviewNote?: string
  reviewedAt?: string
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
  verifiedOnly: boolean
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

export type VerificationSubject = 'owner' | 'property'
export type VerificationDocType =
  | 'national_id'
  | 'passport'
  | 'selfie'
  | 'land_title'
  | 'lease_contract'
  | 'authorisation_letter'
  | 'utility_bill'

export interface VerificationDocument {
  id: string
  type: VerificationDocType
  fileName: string
  /** Object URL for files uploaded this session; seeded documents have none. */
  url?: string
}

export type VerificationRequestStatus = 'pending' | 'approved' | 'rejected'

export interface VerificationRequest {
  id: string
  subject: VerificationSubject
  ownerId: string
  /** Set when `subject` is 'property'. */
  propertyId?: string
  /** National ID or passport number. Owner requests only. */
  idNumber?: string
  /** Land title UPI. Property requests only. */
  upi?: string
  /** Whether the submitter holds the title or manages the property for the title holder. */
  relationship?: 'owner' | 'agent'
  documents: VerificationDocument[]
  note?: string
  status: VerificationRequestStatus
  reviewerNote?: string
  reviewedBy?: string
  submittedAt: string
  reviewedAt?: string
}

export type ViewingStatus = 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled'

export interface Viewing {
  id: string
  propertyId: string
  tenantId: string
  ownerId: string
  scheduledAt: string
  note?: string
  status: ViewingStatus
  createdAt: string
}

export type RentalApplicationStatus = 'submitted' | 'approved' | 'rejected' | 'withdrawn'

export interface RentalApplication {
  id: string
  propertyId: string
  tenantId: string
  ownerId: string
  moveInDate: string
  leaseMonths: number
  occupants: number
  occupation: string
  monthlyIncome?: number
  message: string
  status: RentalApplicationStatus
  createdAt: string
}

export type AgreementStatus = 'awaiting_owner' | 'awaiting_tenant' | 'active' | 'ended' | 'cancelled'

export interface Signature {
  name: string
  signedAt: string
}

export interface Agreement {
  id: string
  applicationId?: string
  propertyId: string
  tenantId: string
  ownerId: string
  monthlyRent: number
  deposit: number
  startDate: string
  endDate: string
  noticeDays: number
  terms: string[]
  status: AgreementStatus
  ownerSignature?: Signature
  tenantSignature?: Signature
  createdAt: string
}

export type MaintenanceCategory = 'plumbing' | 'electrical' | 'water' | 'security' | 'appliance' | 'structural' | 'other'
export type MaintenanceUrgency = 'low' | 'medium' | 'urgent'
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved'

export interface MaintenanceRequest {
  id: string
  propertyId: string
  tenantId: string
  ownerId: string
  category: MaintenanceCategory
  urgency: MaintenanceUrgency
  title: string
  description: string
  status: MaintenanceStatus
  ownerNote?: string
  createdAt: string
  updatedAt: string
}

export type ReportReason =
  | 'upfront_payment'
  | 'not_owner'
  | 'fake_photos'
  | 'already_taken'
  | 'duplicate'
  | 'wrong_info'
  | 'other'
export type ReportStatus = 'open' | 'actioned' | 'dismissed'

export interface Report {
  id: string
  propertyId: string
  reporterId?: string
  reason: ReportReason
  details: string
  status: ReportStatus
  resolution?: string
  createdAt: string
}

export type DisputeTopic = 'deposit' | 'repairs' | 'agreement' | 'conduct' | 'other'
export type DisputeStatus = 'open' | 'in_review' | 'resolved'

export interface Dispute {
  id: string
  agreementId: string
  propertyId: string
  raisedById: string
  againstId: string
  topic: DisputeTopic
  description: string
  status: DisputeStatus
  resolution?: string
  createdAt: string
}

export type NotificationChannel = 'in_app' | 'sms' | 'push'

export interface AppNotification {
  id: string
  /** A user id, or `role:admin` to reach every admin. */
  userId: string
  title: string
  body: string
  href?: string
  channels: NotificationChannel[]
  read: boolean
  createdAt: string
}

export interface SavedSearch {
  id: string
  name: string
  /** The browse page query string this search was saved from. */
  query: string
  alerts: boolean
  createdAt: string
  /** Listings created after this are counted as "new" for the alert badge. */
  lastCheckedAt: string
}
