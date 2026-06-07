import { hdrLabel, resolutionLabel, videoCodecLabel } from '@/lib/mediaInfo'
import type { BaseItemDto } from '@/api/types'

export function MediaBadges({ item }: { item: BaseItemDto }) {
  const badges = [resolutionLabel(item), hdrLabel(item), videoCodecLabel(item)].filter(
    (x): x is string => !!x,
  )
  if (badges.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b}
          className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-neutral-300 ring-1 ring-line"
        >
          {b}
        </span>
      ))}
    </div>
  )
}
