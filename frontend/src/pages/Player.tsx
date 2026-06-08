import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MediaPlayer, MediaProvider, Track, type MediaPlayerInstance } from '@vidstack/react'
import {
  DefaultMenuRadioGroup,
  DefaultMenuSection,
  DefaultVideoLayout,
  defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { ArrowLeft, RotateCcw, SkipForward } from 'lucide-react'

import {
  getEpisodes,
  getItem,
  getPlaybackInfo,
  reportProgress,
  reportStart,
  reportStopped,
  reportStoppedBeacon,
  resolveStreamUrl,
} from '@/api/jellyfin'
import { QUALITY_TIERS } from '@/api/config'
import { useCollectionMembership } from '@/hooks/useCollectionMembership'
import { Spinner } from '@/components/Spinner'
import { buildChaptersVtt, introRange, type IntroRange } from '@/lib/chapters'
import { secondsToTicks, ticksToSeconds } from '@/lib/format'
import type { MediaStream } from '@/api/types'

const PROGRESS_INTERVAL_SECONDS = 10
const QUALITY_KEY = 'myflix.qualityIdx'
const AUDIOLANG_KEY = 'myflix.audioLang'

const QUALITY = QUALITY_TIERS

interface SubTrack {
  index: number
  label: string
}

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const playerRef = useRef<MediaPlayerInstance>(null)
  const { data: membership } = useCollectionMembership()

  const [title, setTitle] = useState('')
  const [src, setSrc] = useState<string | null>(null)
  const [audioStreams, setAudioStreams] = useState<MediaStream[]>([])
  const [audioIndex, setAudioIndex] = useState<number | undefined>(undefined)
  const [subTracks, setSubTracks] = useState<SubTrack[]>([])
  const [subIndex, setSubIndex] = useState<number>(-1) // -1 = Off
  const [chaptersUrl, setChaptersUrl] = useState<string | null>(null)
  const [intro, setIntro] = useState<IntroRange | null>(null)
  const [showSkip, setShowSkip] = useState(false)
  const [qualityIdx, setQualityIdx] = useState(() => Number(localStorage.getItem(QUALITY_KEY) ?? 0))
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const playSession = useRef<{ playSessionId: string } | null>(null)
  const lastReportedAt = useRef(0)
  const seekTo = useRef(0)
  const episodeInfo = useRef<{ seriesId: string; seasonId: string; index: number } | null>(null)

  // (Re)request the stream. The chosen subtitle (-1 = off) is forced into the
  // transcode URL by resolveStreamUrl, so changing it re-requests the stream.
  const load = useCallback(
    async (opts: {
      audio?: number
      subtitle?: number
      maxBitrate?: number
      maxWidth?: number
      startAt?: number
    }) => {
      if (!id) return
      try {
        const info = await getPlaybackInfo(id, {
          startPositionTicks: 0,
          audioStreamIndex: opts.audio,
          maxBitrate: opts.maxBitrate,
          maxWidth: opts.maxWidth,
        })
        seekTo.current = opts.startAt ?? 0
        playSession.current = { playSessionId: info.PlaySessionId }
        setError(null)
        setSrc(resolveStreamUrl(id, info, opts.subtitle ?? -1))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not start playback.')
      }
    },
    [id],
  )

  useEffect(() => {
    let cancelled = false
    async function setup() {
      if (!id) return
      try {
        await runSetup()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load this title.')
      }
    }
    async function runSetup() {
      if (!id) return
      const item = await getItem(id)
      if (cancelled) return
      setError(null)
      setTitle(item.SeriesName ? `${item.SeriesName} — ${item.Name}` : item.Name)
      episodeInfo.current =
        item.Type === 'Episode' && item.SeriesId && item.SeasonId
          ? { seriesId: item.SeriesId, seasonId: item.SeasonId, index: item.IndexNumber ?? -1 }
          : null

      const vtt = buildChaptersVtt(item.Chapters, item.RunTimeTicks)
      if (vtt) setChaptersUrl(URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' })))
      setIntro(introRange(item.Chapters, item.RunTimeTicks))

      const q = QUALITY[Number(localStorage.getItem(QUALITY_KEY) ?? 0)] ?? QUALITY[0]
      const info = await getPlaybackInfo(id, {
        startPositionTicks: 0,
        maxBitrate: q.bitrate,
        maxWidth: q.width,
      })
      if (cancelled) return
      const source = info.MediaSources[0]
      const streams = source.MediaStreams ?? []

      const audio = streams.filter((s) => s.Type === 'Audio')
      setAudioStreams(audio)
      const savedAudioLang = localStorage.getItem(AUDIOLANG_KEY)
      setAudioIndex(
        audio.find((a) => savedAudioLang && a.Language === savedAudioLang)?.Index ??
          source.DefaultAudioStreamIndex ??
          audio[0]?.Index,
      )

      // All subtitle streams (text + image). Selecting one re-requests the stream
      // with it burned in; "Off" forces SubtitleStreamIndex=-1 so none is burned.
      setSubTracks(
        streams
          .filter((s) => s.Type === 'Subtitle')
          .map<SubTrack>((s) => ({
            index: s.Index,
            label: s.DisplayTitle ?? s.Language ?? `Subtitle ${s.Index}`,
          })),
      )
      setSubIndex(-1)

      seekTo.current = ticksToSeconds(item.UserData?.PlaybackPositionTicks ?? 0)
      playSession.current = { playSessionId: info.PlaySessionId }
      setSrc(resolveStreamUrl(id, info, -1))
    }
    void setup()
    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  useEffect(() => {
    return () => {
      if (chaptersUrl) URL.revokeObjectURL(chaptersUrl)
    }
  }, [chaptersUrl])

  useEffect(() => {
    return () => {
      const s = playSession.current
      const player = playerRef.current
      if (s && player && id) {
        void reportStopped(id, s.playSessionId, secondsToTicks(player.currentTime))
      }
    }
  }, [id])

  // The unmount cleanup above doesn't run if the tab is closed/backgrounded, so
  // report the stop via a beacon on pagehide (the position is preserved for
  // "Continue Watching" even on a hard exit).
  useEffect(() => {
    const onPageHide = () => {
      const s = playSession.current
      const player = playerRef.current
      if (s && player && id) {
        reportStoppedBeacon(id, s.playSessionId, secondsToTicks(player.currentTime))
      }
    }
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [id])

  function onCanPlay() {
    const player = playerRef.current
    const s = playSession.current
    if (!player) return
    if (seekTo.current > 0) {
      player.currentTime = seekTo.current
      seekTo.current = 0
    }
    if (s && id) void reportStart(id, s.playSessionId, secondsToTicks(player.currentTime))
  }

  // Flush the current position to Jellyfin immediately (used on pause/play/seek
  // so "Continue Watching" stays accurate without waiting for the next tick).
  const flushProgress = useCallback(() => {
    const player = playerRef.current
    const s = playSession.current
    if (!player || !s || !id) return
    lastReportedAt.current = player.currentTime
    void reportProgress(id, s.playSessionId, secondsToTicks(player.currentTime), player.paused)
  }, [id])

  function onTimeUpdate() {
    const player = playerRef.current
    const s = playSession.current
    if (!player || !s || !id) return
    const now = player.currentTime
    if (intro) setShowSkip(now >= intro.start && now < intro.end - 1)
    if (Math.abs(now - lastReportedAt.current) >= PROGRESS_INTERVAL_SECONDS) {
      lastReportedAt.current = now
      void reportProgress(id, s.playSessionId, secondsToTicks(now), player.paused)
    }
  }

  function reload(next: { audio?: number; subtitle?: number; quality?: number }) {
    const q = QUALITY[next.quality ?? qualityIdx]
    void load({
      audio: next.audio ?? audioIndex,
      subtitle: next.subtitle ?? subIndex,
      maxBitrate: q.bitrate,
      maxWidth: q.width,
      startAt: playerRef.current?.currentTime ?? 0,
    })
  }

  function changeQuality(idx: number) {
    setQualityIdx(idx)
    localStorage.setItem(QUALITY_KEY, String(idx))
    reload({ quality: idx })
  }

  function changeAudio(idx: number) {
    setAudioIndex(idx)
    const lang = audioStreams.find((a) => a.Index === idx)?.Language
    if (lang) localStorage.setItem(AUDIOLANG_KEY, lang)
    reload({ audio: idx })
  }

  // Subtitles are burned in server-side, so changing re-requests the stream.
  function changeSubtitle(idx: number) {
    setSubIndex(idx)
    reload({ subtitle: idx })
  }

  async function onEnded() {
    if (!id) return
    const epi = episodeInfo.current
    if (epi) {
      try {
        const eps = await getEpisodes(epi.seriesId, epi.seasonId)
        const next = eps.find((e) => (e.IndexNumber ?? -1) === epi.index + 1)
        if (next) {
          navigate(`/watch/${next.Id}`)
          return
        }
      } catch {
        /* fall through */
      }
    }
    const col = membership?.[id]
    if (!col) return
    const idx = col.items.indexOf(id)
    const next = idx >= 0 ? col.items[idx + 1] : undefined
    if (next) navigate(`/watch/${next}`)
  }

  const isHls = src?.includes('.m3u8')

  const menuSlots = useMemo(
    () => ({
      settingsMenuItemsEnd: (
        <>
          <DefaultMenuSection label="Quality">
            <DefaultMenuRadioGroup
              value={String(qualityIdx)}
              options={QUALITY.map((q, i) => ({ label: q.label, value: String(i) }))}
              onChange={(v) => changeQuality(Number(v))}
            />
          </DefaultMenuSection>
          {audioStreams.length > 1 && audioIndex != null && (
            <DefaultMenuSection label="Audio">
              <DefaultMenuRadioGroup
                value={String(audioIndex)}
                options={audioStreams.map((a) => ({
                  label: a.DisplayTitle ?? a.Language ?? `Track ${a.Index}`,
                  value: String(a.Index),
                }))}
                onChange={(v) => changeAudio(Number(v))}
              />
            </DefaultMenuSection>
          )}
          {subTracks.length > 0 && (
            <DefaultMenuSection label="Subtitles">
              <DefaultMenuRadioGroup
                value={String(subIndex)}
                options={[
                  { label: 'Off', value: '-1' },
                  ...subTracks.map((t) => ({ label: t.label, value: String(t.index) })),
                ]}
                onChange={(v) => changeSubtitle(Number(v))}
              />
            </DefaultMenuSection>
          )}
        </>
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qualityIdx, audioStreams, audioIndex, subTracks, subIndex],
  )

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 z-[60] flex items-center gap-1.5 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/10 backdrop-blur-md transition hover:bg-black/70"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {showSkip && intro && (
        <button
          onClick={() => {
            if (playerRef.current) playerRef.current.currentTime = intro.end
            setShowSkip(false)
          }}
          className="absolute bottom-28 right-8 z-[60] flex items-center gap-2 rounded-full bg-white/90 px-6 py-2.5 font-semibold text-black shadow-lg backdrop-blur transition hover:scale-[1.03] hover:bg-white"
        >
          <SkipForward className="h-5 w-5" /> Skip Intro
        </button>
      )}

      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-md text-lg font-medium text-white">Playback failed</p>
          <p className="max-w-md text-sm text-neutral-400">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setSrc(null)
              setReloadKey((k) => k + 1)
            }}
            className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-semibold text-black transition hover:scale-[1.03]"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
      ) : src ? (
        <MediaPlayer
          ref={playerRef}
          className="h-full w-full"
          title={title}
          src={{ src, type: isHls ? 'application/x-mpegurl' : 'video/mp4' }}
          streamType="on-demand"
          crossOrigin
          autoPlay
          onCanPlay={onCanPlay}
          onTimeUpdate={onTimeUpdate}
          onPause={flushProgress}
          onPlay={flushProgress}
          onSeeked={flushProgress}
          onError={() => setError('The video stream could not be played.')}
          onEnded={onEnded}
        >
          <MediaProvider>
            {chaptersUrl && (
              <Track src={chaptersUrl} kind="chapters" language="en" type="vtt" default />
            )}
          </MediaProvider>
          <DefaultVideoLayout icons={defaultLayoutIcons} slots={menuSlots} />
        </MediaPlayer>
      ) : (
        <Spinner label="Preparing stream…" />
      )}
    </div>
  )
}
