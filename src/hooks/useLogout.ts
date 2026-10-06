import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from './useToast'

/** The one way every menu signs the user out: clear the session, go home, confirm it happened. */
export function useLogout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  return useCallback(() => {
    logout()
    navigate('/')
    showToast('You have been logged out', { description: 'See you soon.', variant: 'success' })
  }, [logout, navigate, showToast])
}
