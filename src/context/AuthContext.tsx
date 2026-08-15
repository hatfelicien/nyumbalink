import { createContext, useCallback, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { authService } from '../services/authService'
import type { LoginInput, RegisterInput } from '../services/authService'
import { STORAGE_KEYS, storage } from '../utils/storage'

interface AuthState {
  user: User | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; user: User }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'USER_UPDATED'; user: User }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, status: 'loading', error: null }
    case 'AUTH_SUCCESS':
      return { user: action.user, status: 'authenticated', error: null }
    case 'AUTH_ERROR':
      return { ...state, status: 'error', error: action.error }
    case 'LOGOUT':
      return { user: null, status: 'idle', error: null }
    case 'USER_UPDATED':
      return { ...state, user: action.user }
    default:
      return state
  }
}

function loadInitialState(): AuthState {
  const persisted = storage.get<User>(STORAGE_KEYS.session)
  return persisted ? { user: persisted, status: 'authenticated', error: null } : { user: null, status: 'idle', error: null }
}

interface AuthContextValue extends AuthState {
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, loadInitialState)

  const login = useCallback(async (input: LoginInput) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const user = await authService.login(input)
      dispatch({ type: 'AUTH_SUCCESS', user })
      storage.set(STORAGE_KEYS.session, user)
      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.'
      dispatch({ type: 'AUTH_ERROR', error: message })
      throw error
    }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const user = await authService.register(input)
      dispatch({ type: 'AUTH_SUCCESS', user })
      storage.set(STORAGE_KEYS.session, user)
      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create your account.'
      dispatch({ type: 'AUTH_ERROR', error: message })
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
    storage.remove(STORAGE_KEYS.session)
  }, [])

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'USER_UPDATED', user })
    storage.set(STORAGE_KEYS.session, user)
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
