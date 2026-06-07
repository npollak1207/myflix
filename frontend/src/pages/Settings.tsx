import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const QUALITY_KEY = 'myflix.qualityIdx'
const QUALITY_LABELS = ['Auto (highest)', '1080p', '720p', '480p']
const PREF_KEYS = ['myflix.qualityIdx', 'myflix.subLang', 'myflix.audioLang', 'myflix.recentSearches']

export default function Settings() {
  const qc = useQueryClient()
  const [quality, setQuality] = useState(Number(localStorage.getItem(QUALITY_KEY) ?? 0))

  function saveQuality(idx: number) {
    setQuality(idx)
    localStorage.setItem(QUALITY_KEY, String(idx))
    toast.success('Default quality saved')
  }

  function clearData() {
    PREF_KEYS.forEach((k) => localStorage.removeItem(k))
    qc.clear()
    setQuality(0)
    toast.success('Local data cleared')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-white">Settings</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-white">Default streaming quality</h2>
        <p className="mb-3 text-sm text-neutral-400">
          New playback starts at this quality. Lower it on slow connections; you can still change it
          per-video from the player&apos;s settings menu.
        </p>
        <select
          value={quality}
          onChange={(e) => saveQuality(Number(e.target.value))}
          className="rounded-lg bg-white/5 px-3 py-2 text-sm text-neutral-200 ring-1 ring-line outline-none transition hover:bg-white/10 focus:ring-2 focus:ring-accent/70"
        >
          {QUALITY_LABELS.map((label, i) => (
            <option key={label} value={i}>
              {label}
            </option>
          ))}
        </select>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold text-white">Subtitles &amp; audio</h2>
        <p className="text-sm text-neutral-400">
          Subtitle size and styling are adjustable per-video from the player&apos;s captions menu.
          Your last-used subtitle and audio language are remembered automatically.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-white">Local data</h2>
        <p className="mb-3 text-sm text-neutral-400">
          Clears cached data, recent searches, and saved preferences on this device. You stay signed
          in.
        </p>
        <button
          onClick={clearData}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white ring-1 ring-line transition hover:bg-white/10"
        >
          Clear local data
        </button>
      </section>
    </div>
  )
}
