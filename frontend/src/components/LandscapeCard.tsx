import { Link } from 'react-router-dom'
import { Play, X } from 'lucide-react'
import { imageUrl, type ImageType } from '@/api/jellyfin'
import { itemBlurHash } from '@/lib/blurhash'
import { BlurImage } from './BlurImage'
import type { BaseItemDto } from '@/api/types'

// 16:9 card for Continue Watching / Next Up (episode stills + movie backdrops).
export function LandscapeCard({
  item,
  onDismiss,
}: {
  item: BaseItemDto
  onDismiss?: (item: BaseItemDto) => void
}) {
  const isEpisode = item.Type === 'Episode'

  let type: ImageType = 'Backdrop'
  let tag = item.BackdropImageTags?.[0]
  if (isEpisode && item.ImageTags?.Primary) {
    type = 'Primary'
    tag = item.ImageTags.Primary
  } else if (!tag && item.ImageTags?.Thumb) {
    type = 'Thumb'
    tag = item.ImageTags.Thumb
  } else if (!tag && item.ImageTags?.Primary) {
    type = 'Primary'
    tag = item.ImageTags.Primary
  }

  const to =
    isEpisode || item.Type === 'Movie'
      ? `/watch/${item.Id}`
      : item.Type === 'Series'
        ? `/series/${item.Id}`
        : `/title/${item.Id}`

  const pct =
    item.UserData?.PlaybackPositionTicks && item.RunTimeTicks
      ? Math.min(100, (item.UserData.PlaybackPositionTicks / item.RunTimeTicks) * 100)
      : 0
  const title = isEpisode ? (item.SeriesName ?? item.Name) : item.Name
  const sub = isEpisode
    ? `S${item.ParentIndexNumber}:E${item.IndexNumber} · ${item.Name}`
    : (item.ProductionYear ?? '')

  return (
    <Link to={to} className="group block w-full">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface ring-1 ring-line transition duration-300 ease-out-soft group-hover:-translate-y-1 group-hover:shadow-glow group-hover:ring-white/20">
        {tag ? (
          <BlurImage
            src={imageUrl(item.Id, type, { maxWidth: 500, tag })}
            blurHash={itemBlurHash(item, type === 'Backdrop' ? 'Backdrop' : 'Primary', tag)}
            alt={item.Name}
            imgClassName="transition duration-500 ease-out-soft group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-sm text-neutral-400">
            {item.Name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>

        {onDismiss && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDismiss(item)
            }}
            aria-label="Remove from Continue Watching"
            className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-black"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="truncate text-sm font-semibold text-white">{title}</div>
          {sub && <div className="truncate text-xs text-neutral-300">{sub}</div>}
        </div>

        {pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </Link>
  )
}
