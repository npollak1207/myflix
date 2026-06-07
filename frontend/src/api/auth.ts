import { api } from './client'
import { clearSession, setSession } from './session'

interface AuthenticationResult {
  User: { Id: string; Name: string }
  AccessToken: string
  ServerId: string
}

export async function login(username: string, password: string): Promise<void> {
  const res = await api<AuthenticationResult>('/Users/AuthenticateByName', {
    method: 'POST',
    body: JSON.stringify({ Username: username, Pw: password }),
  })
  setSession({
    accessToken: res.AccessToken,
    userId: res.User.Id,
    username: res.User.Name,
  })
}

export async function logout(): Promise<void> {
  try {
    await api('/Sessions/Logout', { method: 'POST' })
  } catch {
    // Best effort — clear locally regardless.
  }
  clearSession()
}
