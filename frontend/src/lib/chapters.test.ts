import { describe, expect, it } from 'vitest'
import { buildChaptersVtt, introRange } from './chapters'
import { TICKS_PER_SECOND } from './format'
import type { Chapter } from '@/api/types'

const sec = (s: number): number => s * TICKS_PER_SECOND
const ch = (name: string, startSeconds: number): Chapter => ({
  Name: name,
  StartPositionTicks: sec(startSeconds),
})

describe('introRange', () => {
  it('returns null when there are no chapters', () => {
    expect(introRange(undefined)).toBeNull()
    expect(introRange([])).toBeNull()
  })

  it('returns null when no chapter looks like an intro', () => {
    expect(introRange([ch('Scene 1', 0), ch('Scene 2', 60)])).toBeNull()
  })

  it('detects an intro chapter and ends at the next chapter', () => {
    const chapters = [ch('Cold Open', 0), ch('Intro', 60), ch('Act 1', 150)]
    expect(introRange(chapters)).toEqual({ start: 60, end: 150 })
  })

  it('matches keyword case-insensitively (opening/recap/titles)', () => {
    expect(introRange([ch('OPENING TITLES', 30), ch('Story', 90)])).toEqual({
      start: 30,
      end: 90,
    })
  })

  it('falls back to runtime when the intro is the last chapter', () => {
    expect(introRange([ch('Story', 0), ch('Recap', 100)], sec(180))).toEqual({
      start: 100,
      end: 180,
    })
  })

  it('returns null when the computed range is empty', () => {
    // Intro is last chapter but runtime is before it → end <= start.
    expect(introRange([ch('Intro', 100)], sec(50))).toBeNull()
  })
})

describe('buildChaptersVtt', () => {
  it('returns null without chapters', () => {
    expect(buildChaptersVtt(undefined)).toBeNull()
    expect(buildChaptersVtt([])).toBeNull()
  })

  it('emits a WEBVTT header and one cue per chapter', () => {
    const vtt = buildChaptersVtt([ch('Opening', 0), ch('Middle', 65)], sec(130))
    expect(vtt).toContain('WEBVTT')
    expect(vtt).toContain('00:00:00.000 --> 00:01:05.000')
    expect(vtt).toContain('Opening')
    expect(vtt).toContain('00:01:05.000 --> 00:02:10.000')
    expect(vtt).toContain('Middle')
  })

  it('names unnamed chapters by index', () => {
    const vtt = buildChaptersVtt([{ StartPositionTicks: 0 } as Chapter], sec(60))
    expect(vtt).toContain('Chapter 1')
  })
})
