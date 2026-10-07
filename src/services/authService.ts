import type { User } from '../types'
import { applicationsService } from './applicationsService'
import { credentials } from './credentials'
import { usersService } from './usersService'
import { withDelay } from './delay'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
}

export type LoginBlockReason = 'not-found' | 'wrong-password' | 'pending' | 'rejected' | 'suspended'

/** A sign-in that was refused for a reason the login page should explain, not just toast. */
export class LoginError extends Error {
  readonly reason: LoginBlockReason
  readonly detail?: string

  constructor(reason: LoginBlockReason, message: string, detail?: string) {
    super(message)
    this.reason = reason
    this.detail = detail
  }
}

/**
 * Mock auth. Accounts registered in this browser must use the password they chose;
 * the seeded demo accounts accept any password. There is no real backend yet.
 */
export const authService = {
  async login({ email, password }: LoginInput): Promise<User> {
    const user = await usersService.findByEmail(email)
    if (!user) {
      throw new LoginError('not-found', 'No account found for that email address.')
    }
    if (!credentials.check(user.id, password)) {
      throw new LoginError('wrong-password', 'That password is not correct.')
    }
    if (user.status === 'pending') {
      throw new LoginError(
        'pending',
        'Your landlord account is waiting for approval.',
        'An administrator reviews every new landlord application. We will notify you as soon as yours is approved.',
      )
    }
    if (user.status === 'rejected') {
      const application = await applicationsService.getByUser(user.id)
      throw new LoginError('rejected', 'Your landlord application was not approved.', application?.reviewNote)
    }
    if (user.status === 'suspended') {
      throw new LoginError('suspended', 'This account has been suspended.', 'Contact an administrator if you think this is a mistake.')
    }
    return withDelay(() => user)
  },

  async register({ name, email, phone, password }: RegisterInput): Promise<User> {
    return usersService.registerGuest({ name, email, phone, password })
  },
}
