import type { User } from '../types'
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

/** Mock auth: any password is accepted for a known email. No real backend exists yet. */
export const authService = {
  async login({ email }: LoginInput): Promise<User> {
    const user = await usersService.findByEmail(email)
    if (!user) {
      throw new Error('No account found for that email. Check the demo credentials panel.')
    }
    if (user.status === 'suspended') {
      throw new Error('This account has been suspended. Contact an administrator.')
    }
    return withDelay(() => user)
  },

  async register({ name, email, phone }: RegisterInput): Promise<User> {
    const existing = await usersService.findByEmail(email)
    if (existing) {
      throw new Error('An account with that email already exists.')
    }
    return usersService.registerGuest({ name, email, phone })
  },
}
