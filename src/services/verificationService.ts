import { verificationRequests as seedRequests } from '../data/verifications'
import type { Property, User, VerificationDocument, VerificationRequest } from '../types'
import { generateId } from '../utils/id'
import { findDuplicates, validateNationalId, validateUpi } from '../utils/verification'
import { withDelay } from './delay'
import { ADMIN_AUDIENCE, notify } from './notificationsService'
import { propertiesService } from './propertiesService'
import { usersService } from './usersService'

let store: VerificationRequest[] = [...seedRequests]

export interface OwnerVerificationInput {
  ownerId: string
  idNumber: string
  documents: VerificationDocument[]
  note?: string
}

export interface PropertyVerificationInput {
  ownerId: string
  propertyId: string
  upi: string
  relationship: 'owner' | 'agent'
  documents: VerificationDocument[]
  note?: string
}

export interface VerificationCheck {
  label: string
  /** 'warn' needs a human decision; 'fail' should normally block approval. */
  result: 'pass' | 'warn' | 'fail'
  detail: string
}

export interface VerificationReviewItem {
  request: VerificationRequest
  owner: User | undefined
  property: Property | undefined
  checks: VerificationCheck[]
}

function sortNewestFirst(requests: VerificationRequest[]) {
  return [...requests].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

function hasDoc(request: VerificationRequest, ...types: VerificationDocument['type'][]) {
  return request.documents.some((doc) => types.includes(doc.type))
}

/** The automated pre-checks a reviewer sees next to each request. None of them approve anything on their own. */
function runChecks(request: VerificationRequest, users: User[], properties: Property[]): VerificationCheck[] {
  const owner = users.find((u) => u.id === request.ownerId)
  const checks: VerificationCheck[] = []

  if (request.subject === 'owner') {
    const idNumber = request.idNumber ?? ''
    const isPassport = hasDoc(request, 'passport') && !hasDoc(request, 'national_id')
    const formatError = isPassport ? null : validateNationalId(idNumber)
    checks.push({
      label: 'ID number format',
      result: formatError ? 'fail' : 'pass',
      detail: formatError ?? (isPassport ? 'Passport number — compare against the scan.' : 'Matches the 16-digit national ID format.'),
    })

    const sameId = users.filter((u) => u.id !== request.ownerId && u.nationalId && u.nationalId === idNumber)
    const sameIdRequests = store.filter((r) => r.id !== request.id && r.ownerId !== request.ownerId && r.idNumber === idNumber)
    checks.push({
      label: 'ID not used by another account',
      result: sameId.length + sameIdRequests.length > 0 ? 'fail' : 'pass',
      detail:
        sameId.length + sameIdRequests.length > 0
          ? `Also submitted by ${[
              ...new Set([
                ...sameId.map((u) => u.name),
                ...sameIdRequests.map((r) => users.find((u) => u.id === r.ownerId)?.name ?? 'a removed account'),
              ]),
            ].join(', ')}.`
          : 'No other account has submitted this ID.',
    })

    checks.push({
      label: 'ID document and selfie attached',
      result: hasDoc(request, 'national_id', 'passport') && hasDoc(request, 'selfie') ? 'pass' : 'warn',
      detail: hasDoc(request, 'selfie') ? 'Compare the selfie with the ID photo.' : 'No selfie attached — the face cannot be matched to the ID.',
    })

    checks.push({
      label: 'Account in good standing',
      result: owner?.status === 'active' ? 'pass' : 'warn',
      detail: owner?.status === 'active' ? 'Account is active.' : `Account status is "${owner?.status ?? 'unknown'}".`,
    })
    return checks
  }

  const property = properties.find((p) => p.id === request.propertyId)
  const upi = request.upi ?? ''
  const upiError = validateUpi(upi)
  checks.push({
    label: 'UPI format',
    result: upiError ? 'fail' : 'pass',
    detail: upiError ?? 'Valid parcel identifier — look it up with the National Land Authority to confirm the title holder.',
  })

  const sameUpi = properties.filter((p) => p.id !== request.propertyId && p.upi === upi && p.ownerId !== request.ownerId)
  checks.push({
    label: 'Parcel not claimed by another account',
    result: sameUpi.length > 0 ? 'fail' : 'pass',
    detail: sameUpi.length > 0 ? `Already verified for "${sameUpi[0].title}" under another account.` : 'No other account has verified this parcel.',
  })

  checks.push({
    label: 'Landlord identity verified',
    result: owner?.verification === 'verified' ? 'pass' : 'warn',
    detail:
      owner?.verification === 'verified'
        ? `${owner.name} passed the ID check.`
        : 'The landlord has not passed the ID check yet — the name on the title cannot be matched.',
  })

  if (request.relationship === 'agent') {
    checks.push({
      label: 'Authorisation from the title holder',
      result: hasDoc(request, 'authorisation_letter') ? 'pass' : 'fail',
      detail: hasDoc(request, 'authorisation_letter')
        ? 'Notarised letter attached — confirm it names this account holder.'
        : 'Submitted as an agent without an authorisation letter.',
    })
  } else {
    checks.push({
      label: 'Ownership document attached',
      result: hasDoc(request, 'land_title', 'lease_contract') ? 'pass' : 'fail',
      detail: hasDoc(request, 'land_title', 'lease_contract') ? 'Title or lease contract attached.' : 'No land title or lease contract attached.',
    })
  }

  if (property) {
    const duplicates = findDuplicates(property, properties)
    checks.push({
      label: 'No duplicate listing',
      result: duplicates.length > 0 ? 'warn' : 'pass',
      detail:
        duplicates.length > 0
          ? `Looks like "${duplicates[0].property.title}" (${duplicates[0].reasons.join(', ').toLowerCase()}).`
          : 'No similar listing found.',
    })
  }

  return checks
}

export const verificationService = {
  getByOwner(ownerId: string): Promise<VerificationRequest[]> {
    return withDelay(() => sortNewestFirst(store.filter((r) => r.ownerId === ownerId)))
  },

  /** Everything a reviewer needs for the queue, with the automated pre-checks already run. */
  async listForReview(): Promise<VerificationReviewItem[]> {
    const [users, properties] = await Promise.all([usersService.list(), propertiesService.list()])
    return sortNewestFirst(store).map((request) => ({
      request,
      owner: users.find((u) => u.id === request.ownerId),
      property: properties.find((p) => p.id === request.propertyId),
      checks: runChecks(request, users, properties),
    }))
  },

  countPending(): Promise<number> {
    return withDelay(() => store.filter((r) => r.status === 'pending').length)
  },

  async submitOwner(input: OwnerVerificationInput): Promise<VerificationRequest> {
    const created: VerificationRequest = {
      id: generateId('verification'),
      subject: 'owner',
      ownerId: input.ownerId,
      idNumber: input.idNumber.replace(/\s/g, ''),
      documents: input.documents,
      note: input.note,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
    store = [created, ...store]
    await usersService.update(input.ownerId, { verification: 'pending' })
    notify(ADMIN_AUDIENCE, {
      title: 'Landlord ID submitted',
      body: 'A landlord submitted identity documents for review.',
      href: '/admin/verification',
      channels: ['in_app'],
    })
    return created
  },

  async submitProperty(input: PropertyVerificationInput): Promise<VerificationRequest> {
    const created: VerificationRequest = {
      id: generateId('verification'),
      subject: 'property',
      ownerId: input.ownerId,
      propertyId: input.propertyId,
      upi: input.upi.trim(),
      relationship: input.relationship,
      documents: input.documents,
      note: input.note,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
    store = [created, ...store]
    await propertiesService.update(input.propertyId, { verification: 'pending' })
    notify(ADMIN_AUDIENCE, {
      title: 'Ownership documents submitted',
      body: 'A landlord submitted ownership documents for a listing.',
      href: '/admin/verification',
      channels: ['in_app'],
    })
    return created
  },

  /** Approving or rejecting a request is what grants or withholds the public badge. */
  async review(
    id: string,
    decision: 'approved' | 'rejected',
    reviewerId: string,
    reviewerNote?: string,
  ): Promise<VerificationRequest | undefined> {
    const request = store.find((r) => r.id === id)
    if (!request) return undefined

    const reviewedAt = new Date().toISOString()
    const updated: VerificationRequest = { ...request, status: decision, reviewerNote, reviewedBy: reviewerId, reviewedAt }
    store = store.map((r) => (r.id === id ? updated : r))

    const verification = decision === 'approved' ? 'verified' : 'rejected'
    const verifiedAt = decision === 'approved' ? reviewedAt : undefined

    if (request.subject === 'owner') {
      await usersService.update(request.ownerId, {
        verification,
        verifiedAt,
        ...(decision === 'approved' ? { nationalId: request.idNumber } : {}),
      })
      notify(request.ownerId, {
        title: decision === 'approved' ? 'Your identity is verified' : 'ID verification was not approved',
        body:
          decision === 'approved'
            ? 'The "Verified landlord" badge now shows on your profile and listings.'
            : (reviewerNote ?? 'Check the reviewer note and submit again.'),
        href: '/owner/verification',
      })
    } else if (request.propertyId) {
      const property = await propertiesService.update(request.propertyId, {
        verification,
        verifiedAt,
        ...(decision === 'approved' ? { upi: request.upi } : {}),
      })
      notify(request.ownerId, {
        title: decision === 'approved' ? 'Listing verified' : 'Listing verification was not approved',
        body:
          decision === 'approved'
            ? `"${property?.title ?? 'Your listing'}" now carries the "Verified property" badge.`
            : (reviewerNote ?? 'Check the reviewer note and submit again.'),
        href: '/owner/verification',
      })
    }

    return updated
  },

  /**
   * Withdraws a badge that was already granted — used when an admin revokes directly,
   * or when a landlord changes the verified details of a listing.
   */
  async revoke(subject: 'owner' | 'property', targetId: string): Promise<void> {
    if (subject === 'owner') {
      await usersService.update(targetId, { verification: 'unverified', verifiedAt: undefined })
    } else {
      await propertiesService.update(targetId, { verification: 'unverified', verifiedAt: undefined, upi: undefined })
    }
  },
}
