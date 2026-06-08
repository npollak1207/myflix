import { api } from './client'
import { API_BASE, STREAM_MAX_BITRATE } from './config'
import { getDeviceId, getToken, getUserId } from './session'
import { buildDeviceProfile } from './deviceProfile'
import type { BaseItemDto, ItemsResponse, PlaybackInfoResponse } from './types'

function uid(): string {
  const id = getUserId()
  if (!id) throw new Error('Not authenticated')
  return id
}

// --- Libraries / browsing -------------------------------------------------

export async function getViews(): Promise<BaseItemDto[]> {
  const res = await api<ItemsResponse>(`/Users/${uid()}/Views`)
  return res.Items
}

export async function getResumeItems(): Promise<BaseItemDto[]> {
  const res = await api<ItemsResponse>(
    `/Users/${uid()}/Items/Resume?Limit=20&MediaTypes=Video&Fields=Overview`,
  )
  return res.Items
}

export async function getLatest(parentId?: string, limit = 20): Promise<BaseItemDto[]> {
  const q = new URLSearchParams({ Limit: String(limit), Fields: 'Overview' })
  if (parentId) q.set('ParentId', parentId)
  return api<BaseItemDto[]>(`/Users/${uid()}/Items/Latest?${q.toString()}`)
}

export interface ItemQuery {
  parentId?: string
  includeItemTypes?: string
  sortBy?: string
  sortOrder?: 'Ascending' | 'Descending'
  limit?: number
  startIndex?: number
  searchTerm?: string
  recursive?: boolean
  genreIds?: string
  personIds?: string
  years?: string
  filters?: string // e.g. IsFavorite, IsPlayed, IsUnplayed
  fields?: string // extra Fields to merge in, e.g. MediaStreams
}

export async function getItems(query: ItemQuery = {}): Promise<ItemsResponse> {
  const fields = ['PrimaryImageAspectRatio', 'Overview', query.fields].filter(Boolean).join(',')
  const q = new URLSearchParams({
    Recursive: String(query.recursive ?? true),
    Fields: fields,
    ImageTypeLimit: '1',
    EnableImageTypes: 'Primary,Backdrop,Thumb,Logo',
  })
  if (query.parentId) q.set('ParentId', query.parentId)
  if (query.includeItemTypes) q.set('IncludeItemTypes', query.includeItemTypes)
  if (query.sortBy) q.set('SortBy', query.sortBy)
  if (query.sortOrder) q.set('SortOrder', query.sortOrder)
  if (query.limit != null) q.set('Limit', String(query.limit))
  if (query.startIndex != null) q.set('StartIndex', String(query.startIndex))
  if (query.searchTerm) q.set('SearchTerm', query.searchTerm)
  if (query.genreIds) q.set('GenreIds', query.genreIds)
  if (query.personIds) q.set('PersonIds', query.personIds)
  if (query.years) q.set('Years', query.years)
  if (query.filters) q.set('Filters', query.filters)
  return api<ItemsResponse>(`/Users/${uid()}/Items?${q.toString()}`)
}

export async function getItem(itemId: string): Promise<BaseItemDto> {
  const q = new URLSearchParams({
    Fields:
      'Overview,Genres,GenreItems,Studios,Taglines,People,Chapters,MediaStreams,MediaSources,RemoteTrailers',
  })
  return api<BaseItemDto>(`/Users/${uid()}/Items/${itemId}?${q.toString()}`)
}

// --- TV: seasons / episodes / next up --------------------------------------

export async function getSeasons(seriesId: string): Promise<BaseItemDto[]> {
  const res = await api<ItemsResponse>(`/Shows/${seriesId}/Seasons?userId=${uid()}`)
  return res.Items
}

export async function getEpisodes(seriesId: string, seasonId: string): Promise<BaseItemDto[]> {
  const q = new URLSearchParams({
    userId: uid(),
    seasonId,
    fields: 'Overview,MediaStreams,PrimaryImageAspectRatio',
  })
  const res = await api<ItemsResponse>(`/Shows/${seriesId}/Episodes?${q.toString()}`)
  return res.Items
}

export async function getNextUp(limit = 20): Promise<BaseItemDto[]> {
  const q = new URLSearchParams({
    userId: uid(),
    limit: String(limit),
    fields: 'Overview',
    enableImageTypes: 'Primary,Backdrop,Thumb',
  })
  const res = await api<ItemsResponse>(`/Shows/NextUp?${q.toString()}`)
  return res.Items
}

export async function getSuggestions(limit = 16): Promise<BaseItemDto[]> {
  const q = new URLSearchParams({ type: 'Movie', limit: String(limit) })
  const res = await api<ItemsResponse>(`/Users/${uid()}/Suggestions?${q.toString()}`)
  return res.Items ?? []
}

export async function getRandomMovie(): Promise<BaseItemDto | null> {
  const res = await getItems({ includeItemTypes: 'Movie', recursive: true, sortBy: 'Random', limit: 1 })
  return res.Items[0] ?? null
}

// Remove an item from "Continue Watching" by clearing its resume position.
export async function clearResume(itemId: string): Promise<void> {
  await api(`/Users/${uid()}/Items/${itemId}/UserData`, {
    method: 'POST',
    body: JSON.stringify({ PlaybackPositionTicks: 0 }),
  })
}

// --- Favorites & played state ---------------------------------------------

export async function setFavorite(itemId: string, favorite: boolean): Promise<void> {
  await api(`/Users/${uid()}/FavoriteItems/${itemId}`, { method: favorite ? 'POST' : 'DELETE' })
}

export async function setPlayed(itemId: string, played: boolean): Promise<void> {
  await api(`/Users/${uid()}/PlayedItems/${itemId}`, { method: played ? 'POST' : 'DELETE' })
}

// --- People / collections --------------------------------------------------

export async function getPerson(personId: string): Promise<BaseItemDto> {
  return api<BaseItemDto>(`/Users/${uid()}/Items/${personId}?Fields=Overview`)
}

export async function getCollections(): Promise<BaseItemDto[]> {
  const res = await getItems({
    includeItemTypes: 'BoxSet',
    recursive: true,
    sortBy: 'SortName',
    limit: 50,
  })
  return res.Items
}

export async function getSimilar(itemId: string, limit = 12): Promise<BaseItemDto[]> {
  const q = new URLSearchParams({ UserId: uid(), Limit: String(limit), Fields: 'ProductionYear' })
  const res = await api<ItemsResponse>(`/Items/${itemId}/Similar?${q.toString()}`)
  return res.Items
}

export interface SearchHint {
  Id?: string
  ItemId?: string
  Name: string
  Type: string // Movie | Series | BoxSet | Person | ...
  ProductionYear?: number
  PrimaryImageTag?: string
}

export async function getSearchHints(term: string, limit = 8): Promise<SearchHint[]> {
  const q = new URLSearchParams({
    userId: uid(),
    searchTerm: term,
    limit: String(limit),
    includeItemTypes: 'Movie,Series,BoxSet',
    includePeople: 'true',
    includeMedia: 'true',
    includeGenres: 'false',
    includeStudios: 'false',
    includeArtists: 'false',
  })
  const res = await api<{ SearchHints: SearchHint[] }>(`/Search/Hints?${q.toString()}`)
  return res.SearchHints ?? []
}

export const hintId = (h: SearchHint): string => h.Id ?? h.ItemId ?? ''

export async function getGenres(parentId?: string, limit = 12): Promise<BaseItemDto[]> {
  const q = new URLSearchParams({
    UserId: uid(),
    SortBy: 'SortName',
    Limit: String(limit),
    IncludeItemTypes: 'Movie',
  })
  if (parentId) q.set('ParentId', parentId)
  const res = await api<ItemsResponse>(`/Genres?${q.toString()}`)
  return res.Items
}

// --- Images ---------------------------------------------------------------

export type ImageType = 'Primary' | 'Backdrop' | 'Thumb' | 'Logo'

export function imageUrl(
  itemId: string,
  type: ImageType = 'Primary',
  opts: { maxWidth?: number; tag?: string } = {},
): string {
  const q = new URLSearchParams({ quality: '90' })
  if (opts.maxWidth) q.set('maxWidth', String(opts.maxWidth))
  if (opts.tag) q.set('tag', opts.tag)
  return `${API_BASE}/Items/${itemId}/Images/${type}?${q.toString()}`
}

// Jellyfin transcodes an embedded text subtitle stream to WebVTT on demand,
// so we can deliver it as a sidecar <track> (instant switching, no burn-in).
export function subtitleVttUrl(itemId: string, mediaSourceId: string, streamIndex: number): string {
  const q = new URLSearchParams({ api_key: getToken() ?? '' })
  return `${API_BASE}/Videos/${itemId}/${mediaSourceId}/Subtitles/${streamIndex}/0/Stream.vtt?${q.toString()}`
}

// --- Playback -------------------------------------------------------------

export interface PlaybackOptions {
  startPositionTicks?: number
  audioStreamIndex?: number
  subtitleStreamIndex?: number
  maxBitrate?: number
  maxWidth?: number
}

export async function getPlaybackInfo(
  itemId: string,
  opts: PlaybackOptions = {},
): Promise<PlaybackInfoResponse> {
  const maxBitrate = opts.maxBitrate ?? STREAM_MAX_BITRATE
  const q = new URLSearchParams({
    UserId: uid(),
    StartTimeTicks: String(opts.startPositionTicks ?? 0),
    MaxStreamingBitrate: String(maxBitrate),
  })
  if (opts.audioStreamIndex != null) q.set('AudioStreamIndex', String(opts.audioStreamIndex))
  if (opts.subtitleStreamIndex != null) q.set('SubtitleStreamIndex', String(opts.subtitleStreamIndex))
  return api<PlaybackInfoResponse>(`/Items/${itemId}/PlaybackInfo?${q.toString()}`, {
    method: 'POST',
    body: JSON.stringify({
      DeviceProfile: buildDeviceProfile(maxBitrate, opts.maxWidth),
      MaxStreamingBitrate: maxBitrate,
      AutoOpenLiveStream: true,
    }),
  })
}

// Resolves a directly-playable URL: an HLS master playlist when Jellyfin
// decided to transcode, otherwise a direct stream of the original file.
//
// subtitleStreamIndex forces the burned-in subtitle (-1 = none). We rewrite it
// into the transcode URL directly because Jellyfin's PlaybackInfo ignores -1 and
// auto-burns the file's default subtitle (a problem for image-only subs).
export function resolveStreamUrl(
  itemId: string,
  info: PlaybackInfoResponse,
  subtitleStreamIndex = -1,
): string {
  const source = info.MediaSources[0]
  if (source?.TranscodingUrl) {
    let url = source.TranscodingUrl
    url = /SubtitleStreamIndex=-?\d+/.test(url)
      ? url.replace(/SubtitleStreamIndex=-?\d+/, `SubtitleStreamIndex=${subtitleStreamIndex}`)
      : `${url}${url.includes('?') ? '&' : '?'}SubtitleStreamIndex=${subtitleStreamIndex}`
    return url.startsWith(API_BASE) ? url : `${API_BASE}${url}`
  }
  const q = new URLSearchParams({
    Static: 'true',
    MediaSourceId: source.Id,
    DeviceId: getDeviceId(),
    PlaySessionId: info.PlaySessionId,
    api_key: getToken() ?? '',
  })
  return `${API_BASE}/Videos/${itemId}/stream?${q.toString()}`
}

// --- Playback progress reporting (powers "Continue Watching") --------------

export async function reportStart(
  itemId: string,
  playSessionId: string,
  positionTicks = 0,
): Promise<void> {
  await api('/Sessions/Playing', {
    method: 'POST',
    body: JSON.stringify({
      ItemId: itemId,
      PlaySessionId: playSessionId,
      PositionTicks: positionTicks,
      CanSeek: true,
      IsPaused: false,
    }),
  })
}

export async function reportProgress(
  itemId: string,
  playSessionId: string,
  positionTicks: number,
  isPaused: boolean,
): Promise<void> {
  await api('/Sessions/Playing/Progress', {
    method: 'POST',
    body: JSON.stringify({
      ItemId: itemId,
      PlaySessionId: playSessionId,
      PositionTicks: positionTicks,
      IsPaused: isPaused,
      EventName: 'timeupdate',
    }),
  })
}

export async function reportStopped(
  itemId: string,
  playSessionId: string,
  positionTicks: number,
): Promise<void> {
  await api('/Sessions/Playing/Stopped', {
    method: 'POST',
    body: JSON.stringify({
      ItemId: itemId,
      PlaySessionId: playSessionId,
      PositionTicks: positionTicks,
    }),
  })
}

// Fire-and-forget stop report that survives the page being torn down (tab close,
// navigation). A normal fetch is often cancelled during `pagehide`; sendBeacon is
// queued by the browser and delivered regardless. Auth rides as `api_key` because
// beacons can't set headers. Returns false if the beacon couldn't be queued
// (caller should fall back to reportStopped).
export function reportStoppedBeacon(
  itemId: string,
  playSessionId: string,
  positionTicks: number,
): boolean {
  if (typeof navigator.sendBeacon !== 'function') return false
  const url = `${API_BASE}/Sessions/Playing/Stopped?api_key=${encodeURIComponent(getToken() ?? '')}`
  const body = new Blob(
    [JSON.stringify({ ItemId: itemId, PlaySessionId: playSessionId, PositionTicks: positionTicks })],
    { type: 'application/json' },
  )
  return navigator.sendBeacon(url, body)
}
