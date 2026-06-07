import { describe, expect, it } from 'vitest'
import { resolveStreamUrl } from './jellyfin'
import type { PlaybackInfoResponse } from './types'

const info = (transcodingUrl?: string): PlaybackInfoResponse => ({
  PlaySessionId: 'ps',
  MediaSources: [{ Id: 'src1', TranscodingUrl: transcodingUrl }],
})

describe('resolveStreamUrl', () => {
  it('prefixes a relative transcoding URL and forces subtitles off by default', () => {
    expect(resolveStreamUrl('item1', info('/videos/item1/master.m3u8?x=1'))).toBe(
      '/jellyfin/videos/item1/master.m3u8?x=1&SubtitleStreamIndex=-1',
    )
  })

  it('does not double-prefix when the base path is already present', () => {
    expect(resolveStreamUrl('item1', info('/jellyfin/videos/item1/master.m3u8'))).toBe(
      '/jellyfin/videos/item1/master.m3u8?SubtitleStreamIndex=-1',
    )
  })

  it('overrides an existing SubtitleStreamIndex with the chosen track', () => {
    expect(
      resolveStreamUrl('item1', info('/videos/item1/master.m3u8?SubtitleStreamIndex=2'), 5),
    ).toBe('/jellyfin/videos/item1/master.m3u8?SubtitleStreamIndex=5')
  })
})
