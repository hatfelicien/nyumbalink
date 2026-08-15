import type { Payment, PaymentMethod, PaymentPurpose } from '../types'
import { generateId } from '../utils/id'
import { withDelay } from './delay'

let store: Payment[] = []

export interface InitiatePaymentInput {
  propertyId: string
  guestId: string
  method: PaymentMethod
  phone: string
  amount: number
  purpose: PaymentPurpose
}

function generateReference() {
  return `NL${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

/**
 * Mock mobile money flow: no real MTN/Airtel integration exists. Simulates the
 * USSD push prompt delay a guest would see on their phone, then resolves to a
 * success/failure so the UI has something real to react to.
 */
export const paymentService = {
  async initiatePayment(input: InitiatePaymentInput): Promise<Payment> {
    const created: Payment = {
      ...input,
      id: generateId('payment'),
      status: 'pending',
      reference: generateReference(),
      createdAt: new Date().toISOString(),
    }
    store = [created, ...store]
    return withDelay(() => created, 200, 400)
  },

  async confirmPayment(id: string): Promise<Payment | undefined> {
    // Simulates the guest approving the USSD prompt on their phone. A small
    // failure chance keeps the flow honest instead of always succeeding.
    const outcome = Math.random() > 0.12 ? 'success' : 'failed'
    store = store.map((p) => (p.id === id ? { ...p, status: outcome } : p))
    return withDelay(() => store.find((p) => p.id === id), 1600, 2600)
  },

  getByGuest(guestId: string): Promise<Payment[]> {
    return withDelay(() => store.filter((p) => p.guestId === guestId))
  },
}
