import type { Chapter } from '@/api/types'
import { ticksToSeconds } from './format'

function vttTime(totalSeconds: number): string {
  const hh = Math.floor(totalSeconds / 3600)
  const mm = Math.floor((totalSeconds % 3600) / 60)
  const ss = totalSeconds % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${ss.toFixed(3).padStart(6, '0')}`
}

// Build a WebVTT chapters file so Vidstack can show chapter markers/titles.
export function buildChaptersVtt(chapters: Chapter[] | undefined, runtimeTicks?: number): string | null {
  if (!chapters || chapters.length === 0) return null
  const lastStart = ticksToSeconds(chapters[chapters.length - 1].StartPositionTicks)
  const end = runtimeTicks ? ticksToSeconds(runtimeTicks) : lastStart + 600
  const lines = ['WEBVTT', '']
  chapters.forEach((c, i) => {
    const start = ticksToSeconds(c.StartPositionTicks)
    const next = i + 1 < chapters.length ? ticksToSeconds(chapters[i + 1].StartPositionTicks) : end
    if (next <= start) return
    lines.push(`${vttTime(start)} --> ${vttTime(next)}`, c.Name || `Chapter ${i + 1}`, '')
  })
  return lines.join('\n')
}

export interface IntroRange {
  start: number
  end: number
}

// Detect an intro/recap chapter to power a "Skip Intro" button.
export function introRange(chapters: Chapter[] | undefined, runtimeTicks?: number): IntroRange | null {
  if (!chapters) return null
  const idx = chapters.findIndex((c) => /intro|opening|recap|titles/i.test(c.Name ?? ''))
  if (idx === -1) return null
  const start = ticksToSeconds(chapters[idx].StartPositionTicks)
  const end =
    idx + 1 < chapters.length
      ? ticksToSeconds(chapters[idx + 1].StartPositionTicks)
      : ticksToSeconds(runtimeTicks ?? 0)
  return end > start ? { start, end } : null
}
