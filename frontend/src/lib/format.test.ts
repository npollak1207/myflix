import { describe, expect, it } from 'vitest'
import { formatRuntime, secondsToTicks, TICKS_PER_SECOND, ticksToSeconds } from './format'

describe('time helpers', () => {
  it('converts between ticks and seconds', () => {
    expect(ticksToSeconds(TICKS_PER_SECOND)).toBe(1)
    expect(secondsToTicks(1)).toBe(TICKS_PER_SECOND)
    expect(ticksToSeconds(0)).toBe(0)
  })

  it('formats runtime as h/m', () => {
    expect(formatRuntime(90 * 60 * TICKS_PER_SECOND)).toBe('1h 30m')
    expect(formatRuntime(45 * 60 * TICKS_PER_SECOND)).toBe('45m')
    expect(formatRuntime(undefined)).toBe('')
  })
})
