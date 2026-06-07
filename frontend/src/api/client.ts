import { API_BASE, CLIENT_NAME, CLIENT_VERSION } from './config'
import { clearSession, getDeviceId, getToken } from './session'

// Builds the Jellyfin "MediaBrowser" authorization header. Token is optional
// pre-login (e.g. for AuthenticateByName).
export function authHeader(token?: string | null): string {
  const parts = [
    `Client="${CLIENT_NAME}"`,
    `Device="Web"`,
    `DeviceId="${getDeviceId()}"`,
    `Version="${CLIENT_VERSION}"`,
  ]
  const t = token === undefined ? getToken() : token
  if (t) parts.push(`Token="${t}"`)
  return `MediaBrowser ${parts.join(', ')}`
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
      ...(init.headers ?? {}),
    },
  })

  if (res.status === 401) {
    // Token expired or revoked — drop it and let the app redirect to login.
    clearSession()
    window.dispatchEvent(new Event('myflix:unauthorized'))
    throw new ApiError(401, 'Unauthorized')
  }
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status} ${res.statusText}`)
  }
  if (res.status === 204) return undefined as T

  const contentType = res.headers.get('content-type') ?? ''
  return (contentType.includes('application/json') ? res.json() : res.text()) as Promise<T>
}
