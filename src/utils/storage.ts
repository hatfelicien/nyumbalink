/** Thin, failure-safe wrapper — storage can throw in private-browsing modes or when full. */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore — storage unavailable or full
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}

export const STORAGE_KEYS = {
  session: 'nyumbalink.session',
  favorites: 'nyumbalink.favorites',
  recentlyViewed: 'nyumbalink.recently-viewed',
  language: 'nyumbalink.language',
  theme: 'nyumbalink.theme',
  compare: 'nyumbalink.compare',
  savedSearches: 'nyumbalink.saved-searches',
  dataSaver: 'nyumbalink.data-saver',
  notificationPrefs: 'nyumbalink.notification-prefs',
  profiles: 'nyumbalink.profiles',
  registeredUsers: 'nyumbalink.registered-users',
  credentials: 'nyumbalink.credentials',
  ownerApplications: 'nyumbalink.owner-applications',
} as const
