import { describe, expect, it } from 'vitest'
import { hdrLabel, posterBadges, resolutionLabel, videoCodecLabel } from './mediaInfo'
import type { BaseItemDto, MediaStream } from '@/api/types'

function movie(video: Partial<MediaStream>): BaseItemDto {
  return {
    Id: 'x',
    Name: 'x',
    Type: 'Movie',
    MediaStreams: [{ Index: 0, Type: 'Video', ...video }],
  } as BaseItemDto
}

describe('mediaInfo', () => {
  it('labels resolution from width', () => {
    expect(resolutionLabel(movie({ Width: 3840 }))).toBe('4K')
    expect(resolutionLabel(movie({ Width: 1920 }))).toBe('1080p')
    expect(resolutionLabel(movie({ Width: 1280 }))).toBe('720p')
    expect(resolutionLabel(movie({}))).toBeNull()
  })

  it('detects HDR / Dolby Vision but not SDR', () => {
    expect(hdrLabel(movie({ VideoRangeType: 'HDR10' }))).toBe('HDR')
    expect(hdrLabel(movie({ VideoRangeType: 'DOVI' }))).toBe('Dolby Vision')
    expect(hdrLabel(movie({ VideoRange: 'SDR' }))).toBeNull()
  })

  it('maps codecs to friendly labels', () => {
    expect(videoCodecLabel(movie({ Codec: 'hevc' }))).toBe('HEVC')
    expect(videoCodecLabel(movie({ Codec: 'h264' }))).toBe('H.264')
  })

  it('combines poster badges', () => {
    expect(posterBadges(movie({ Width: 3840, VideoRangeType: 'HDR10' }))).toEqual(['4K', 'HDR'])
  })
})
