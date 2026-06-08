import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api, authHeader } from './client'
import { getSession, setSession } from './session'

function mockResponse(
  body: unknown,
  init: { status?: number; contentType?: string } = {},
): Response {
  const status = init.status ?? 200
  const headers = new Headers()
  if (init.contentType) headers.set('content-type', init.contentType)
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'STATUS',
    headers,
    json: async () => body,
    text: async () => String(body),
  } as unknown as Response
}

describe('client api()', () => {
  beforeEach(() => {
    localStorage.clear()
    setSession({ accessToken: 'tok', userId: 'u1', username: 'me' })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses JSON responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockResponse({ hello: 'world' }, { contentType: 'application/json' }),
    )
    await expect(api('/ping')).resolves.toEqual({ hello: 'world' })
  })

  it('returns undefined for 204 No Content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse('', { status: 204 }))
    await expect(api('/noop', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('throws ApiError with the status on non-OK responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse('nope', { status: 500 }))
    await expect(api('/boom')).rejects.toMatchObject({ status: 500 })
    await expect(api('/boom')).rejects.toBeInstanceOf(ApiError)
  })

  it('on 401 clears the session and dispatches myflix:unauthorized', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse('', { status: 401 }))
    const onUnauthorized = vi.fn()
    window.addEventListener('myflix:unauthorized', onUnauthorized)

    await expect(api('/secret')).rejects.toMatchObject({ status: 401 })

    expect(onUnauthorized).toHaveBeenCalledOnce()
    expect(getSession()).toBeNull()
    window.removeEventListener('myflix:unauthorized', onUnauthorized)
  })

  it('sends the MediaBrowser auth header with the token', async () => {
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockResponse({}, { contentType: 'application/json' }))
    await api('/ping')
    const headers = (spy.mock.calls[0][1] as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toContain('MediaBrowser')
    expect(headers.Authorization).toContain('Token="tok"')
  })
})

describe('authHeader', () => {
  beforeEach(() => localStorage.clear())

  it('omits the token before login', () => {
    expect(authHeader(null)).not.toContain('Token=')
    expect(authHeader(null)).toContain('Client="MyFlix"')
  })

  it('includes an explicitly passed token', () => {
    expect(authHeader('abc')).toContain('Token="abc"')
  })
})
