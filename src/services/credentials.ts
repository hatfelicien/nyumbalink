import { STORAGE_KEYS, storage } from '../utils/storage'

/*
 * Passwords for accounts registered in this browser. This is a stand-in for a real auth
 * backend so that "register, then log in with that password" behaves as people expect:
 * the hash below is NOT a security measure (anything in localStorage is readable), and a
 * real deployment must check passwords on the server. Seeded demo accounts have no entry,
 * so they keep accepting any password.
 *
 * Entries are keyed by user id rather than email, so changing your email keeps your password.
 */

type CredentialMap = Record<string, string>

function load(): CredentialMap {
  return storage.get<CredentialMap>(STORAGE_KEYS.credentials) ?? {}
}

/** cyrb53 — a fast, non-cryptographic 53-bit string hash. */
function hash(text: string) {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

const digest = (userId: string, password: string) => hash(`nyumbalink:${userId}:${password}`)

export const credentials = {
  set(userId: string, password: string) {
    const map = load()
    map[userId] = digest(userId, password)
    storage.set(STORAGE_KEYS.credentials, map)
  },

  /** True when no password was ever set for this account (demo accounts), or when it matches. */
  check(userId: string, password: string) {
    const stored = load()[userId]
    return stored === undefined || stored === digest(userId, password)
  },

  has(userId: string) {
    return userId in load()
  },
}
