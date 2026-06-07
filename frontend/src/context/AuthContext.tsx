import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout } from '@/api/auth'
import { clearSession, getSession, type Session } from '@/api/session'

interface AuthState {
  session: Session | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession())

  // The API client dispatches this when a request returns 401.
  useEffect(() => {
    const onUnauthorized = () => {
      clearSession()
      setSession(null)
    }
    window.addEventListener('myflix:unauthorized', onUnauthorized)
    return () => window.removeEventListener('myflix:unauthorized', onUnauthorized)
  }, [])

  const login = async (username: string, password: string) => {
    await apiLogin(username, password)
    setSession(getSession())
  }

  const logout = async () => {
    await apiLogout()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{ session, isAuthenticated: !!session, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
