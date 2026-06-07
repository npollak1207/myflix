import type { BaseItemDto, MediaStream } from '@/api/types'

function videoStream(item: BaseItemDto): MediaStream | undefined {
  const streams = item.MediaSources?.[0]?.MediaStreams ?? item.MediaStreams
  return streams?.find((s) => s.Type === 'Video')
}

export function resolutionLabel(item: BaseItemDto): string | null {
  const w = videoStream(item)?.Width
  if (!w) return null
  if (w >= 3800) return '4K'
  if (w >= 2500) return '1440p'
  if (w >= 1700) return '1080p'
  if (w >= 1200) return '720p'
  return 'SD'
}

export function hdrLabel(item: BaseItemDto): string | null {
  const v = videoStream(item)
  const range = v?.VideoRangeType ?? v?.VideoRange
  if (!range || range.toUpperCase() === 'SDR') return null
  const r = range.toUpperCase()
  if (r.includes('DOVI') || r.includes('DV')) return 'Dolby Vision'
  if (r.includes('HLG')) return 'HLG'
  return 'HDR'
}

export function videoCodecLabel(item: BaseItemDto): string | null {
  const codec = videoStream(item)?.Codec
  if (!codec) return null
  const map: Record<string, string> = {
    hevc: 'HEVC',
    h265: 'HEVC',
    h264: 'H.264',
    av1: 'AV1',
    vp9: 'VP9',
    mpeg2video: 'MPEG-2',
  }
  return map[codec.toLowerCase()] ?? codec.toUpperCase()
}

// Compact set for poster overlays (resolution + HDR only).
export function posterBadges(item: BaseItemDto): string[] {
  return [resolutionLabel(item), hdrLabel(item)].filter((x): x is string => !!x)
}
