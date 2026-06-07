// Tells Jellyfin what this browser client can play directly vs. what must be
// transcoded. Anything not matched by a DirectPlayProfile is transcoded to
// HLS (h264/aac in an MPEG-TS container) — which Quick Sync handles in hardware.
import { STREAM_MAX_BITRATE, STREAM_MAX_WIDTH } from './config'

export function buildDeviceProfile(
  maxBitrate: number = STREAM_MAX_BITRATE,
  maxWidth: number = STREAM_MAX_WIDTH,
) {
  return {
    MaxStreamingBitrate: maxBitrate,
    MaxStaticBitrate: 100_000_000,
    DirectPlayProfiles: [
      {
        Container: 'mp4,m4v',
        Type: 'Video',
        VideoCodec: 'h264,hevc,av1',
        AudioCodec: 'aac,mp3,ac3,eac3,opus,flac',
      },
      {
        Container: 'webm',
        Type: 'Video',
        VideoCodec: 'vp8,vp9,av1',
        AudioCodec: 'vorbis,opus',
      },
    ],
    TranscodingProfiles: [
      {
        Container: 'ts',
        Type: 'Video',
        VideoCodec: 'h264',
        AudioCodec: 'aac,mp3',
        Protocol: 'hls',
        Context: 'Streaming',
        MaxAudioChannels: '2',
        MinSegments: 1,
        BreakOnNonKeyFrames: true,
      },
    ],
    CodecProfiles: maxWidth
      ? [
          {
            Type: 'Video',
            Conditions: [
              {
                Condition: 'LessThanEqual',
                Property: 'Width',
                Value: String(maxWidth),
                IsRequired: false,
              },
            ],
          },
        ]
      : [],
    ContainerProfiles: [],
    // Burn the selected subtitle into the video. The client forces the exact
    // index via resolveStreamUrl (-1 = none), so nothing burns unless chosen.
    // Encode is required because the library is mostly image-based (PGS) subs.
    SubtitleProfiles: [
      { Format: 'subrip', Method: 'Encode' },
      { Format: 'srt', Method: 'Encode' },
      { Format: 'ass', Method: 'Encode' },
      { Format: 'ssa', Method: 'Encode' },
      { Format: 'pgssub', Method: 'Encode' },
      { Format: 'dvdsub', Method: 'Encode' },
      { Format: 'vtt', Method: 'Encode' },
    ],
  }
}
