// Lightweight session + device persistence. Kept dependency-free so both the
// API client and the auth module can import it without circular references.

export interface Session {
  accessToken: string
  userId: string
  username: string
}

const SESSION_KEY = 'myflix.session'
const DEVICE_KEY = 'myflix.deviceId'

let cached: Session | null | undefined

export function getSession(): Session | null {
  if (cached !== undefined) return cached
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    cached = raw ? (JSON.parse(raw) as Session) : null
  } catch {
    cached = null
  }
  return cached
}

export function setSession(s: Session): void {
  cached = s
  localStorage.setItem(SESSION_KEY, JSON.stringify(s))
}

export function clearSession(): void {
  cached = null
  localStorage.removeItem(SESSION_KEY)
}

export function getToken(): string | null {
  return getSession()?.accessToken ?? null
}

export function getUserId(): string | null {
  return getSession()?.userId ?? null
}

// Stable per-browser device id, required by Jellyfin's auth + playback APIs.
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}
