import type { Coordinates, MonthlyCosts, Property, User, VerificationDocType } from '../types'
import { distanceKm } from './constants'

export const DOC_TYPE_LABELS: Record<VerificationDocType, string> = {
  national_id: 'National ID (Indangamuntu)',
  passport: 'Passport',
  selfie: 'Selfie holding the ID',
  land_title: 'Land title (e-title)',
  lease_contract: 'Emphyteutic lease contract',
  authorisation_letter: 'Notarised authorisation letter',
  utility_bill: 'WASAC / cash power bill',
}

/**
 * Rwandan national IDs are 16 digits: a status digit (1 citizen, 2 refugee, 3 foreign
 * resident), the four-digit birth year, a sex digit (8 male, 7 female), then serial and
 * check digits. This validates the shape only — it cannot confirm the ID exists at NIDA.
 */
export function validateNationalId(value: string): string | null {
  const digits = value.replace(/\s/g, '')
  if (!/^\d{16}$/.test(digits)) return 'A national ID has 16 digits'
  if (!/^[123]/.test(digits)) return 'A national ID starts with 1, 2 or 3'
  const birthYear = Number(digits.slice(1, 5))
  const age = new Date().getFullYear() - birthYear
  if (age < 16 || age > 110) return 'The birth year in this ID is not plausible'
  if (!/^[78]$/.test(digits[5])) return 'The sixth digit of a national ID is 7 or 8'
  return null
}

/** UPIs read province/district/sector/cell/parcel, e.g. 1/02/09/03/1184. */
export function validateUpi(value: string): string | null {
  return /^[1-5]\/\d{2}\/\d{2}\/\d{2}\/\d{1,6}$/.test(value.trim()) ? null : 'Use the format 1/02/09/03/1184'
}

export type TrustLevel = 'full' | 'property' | 'landlord' | 'none'

/** Combines the two independent checks into the single trust level shown on a listing. */
export function trustLevel(property: Pick<Property, 'verification'>, owner?: Pick<User, 'verification'> | null): TrustLevel {
  const propertyOk = property.verification === 'verified'
  const ownerOk = owner?.verification === 'verified'
  if (propertyOk && ownerOk) return 'full'
  if (propertyOk) return 'property'
  if (ownerOk) return 'landlord'
  return 'none'
}

const COST_KEYS: (keyof MonthlyCosts)[] = ['water', 'electricity', 'internet', 'security', 'garbage']

/** Fills in any missing bill with 0, e.g. for half-completed form values. */
export function completeMonthlyCosts(costs: Partial<MonthlyCosts>): MonthlyCosts {
  return Object.fromEntries(COST_KEYS.map((key) => [key, costs[key] || 0])) as unknown as MonthlyCosts
}

export function totalMonthlyCosts(costs: Partial<MonthlyCosts>) {
  return COST_KEYS.reduce((sum, key) => sum + (costs[key] || 0), 0)
}

/**
 * The position shown on public maps. Approximate listings snap to a ~1km grid so the
 * pin marks the neighbourhood rather than the gate.
 */
export function publicCoordinates(property: Pick<Property, 'coordinates' | 'locationPrecision'>): Coordinates {
  if (property.locationPrecision === 'exact') return property.coordinates
  return {
    lat: Math.round(property.coordinates.lat * 100) / 100,
    lng: Math.round(property.coordinates.lng * 100) / 100,
  }
}

export interface DuplicateMatch {
  property: Property
  reasons: string[]
}

type DuplicateCandidate = Pick<Property, 'title' | 'coordinates' | 'type' | 'bedrooms' | 'ownerId' | 'images'> & { id?: string }

function normaliseTitle(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/**
 * Finds listings that look like the same home posted twice — the usual shape of a
 * cloned-listing scam. A shared photo alone is not enough (owners reuse compound
 * shots), and units in one building from the same owner are expected, so the
 * location rule only applies across different accounts.
 */
export function findDuplicates(candidate: DuplicateCandidate, all: Property[]): DuplicateMatch[] {
  const title = normaliseTitle(candidate.title)

  return all
    .filter((other) => other.id !== candidate.id)
    .map((other) => {
      const reasons: string[] = []
      const otherAccount = other.ownerId !== candidate.ownerId
      if (title.length > 0 && normaliseTitle(other.title) === title) reasons.push('Identical title')
      if (
        otherAccount &&
        other.type === candidate.type &&
        other.bedrooms === candidate.bedrooms &&
        distanceKm(other.coordinates, candidate.coordinates) < 0.06
      ) {
        reasons.push('Same location, type and size under another account')
      }
      if (reasons.length > 0 && candidate.images[0] && other.images[0] === candidate.images[0]) {
        reasons.push('Same cover photo')
      }
      return { property: other, reasons }
    })
    .filter((match) => match.reasons.length > 0)
}
