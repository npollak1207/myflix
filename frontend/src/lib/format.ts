export const TICKS_PER_SECOND = 10_000_000

export const ticksToSeconds = (ticks = 0): number => ticks / TICKS_PER_SECOND
export const secondsToTicks = (seconds = 0): number => Math.round(seconds * TICKS_PER_SECOND)

export function formatRuntime(ticks?: number): string {
  if (!ticks) return ''
  const totalMinutes = Math.round(ticks / TICKS_PER_SECOND / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}
