import { Link, useNavigate } from 'react-router-dom'
import { Check, Play, Plus, X } from 'lucide-react'
import { imageUrl } from '@/api/jellyfin'
import { posterBadges } from '@/lib/mediaInfo'
import { itemBlurHash } from '@/lib/blurhash'
import { useToggleFavorite } from '@/hooks/useUserActions'
import { BlurImage } from './BlurImage'
import type { BaseItemDto } from '@/api/types'

interface Props {
  item: BaseItemDto
  /** When provided, shows a hover "remove" button (used for Continue Watching). */
  onDismiss?: (item: BaseItemDto) => void
}

export function PosterCard({ item, onDismiss }: Props) {
  const navigate = useNavigate()
  const favorite = useToggleFavorite()
  const tag = item.ImageTags?.Primary
  const watched = item.UserData?.Played
  const isFavorite = !!item.UserData?.IsFavorite
  const pct =
    item.UserData?.PlaybackPositionTicks && item.RunTimeTicks
      ? Math.min(100, (item.UserData.PlaybackPositionTicks / item.RunTimeTicks) * 100)
      : 0
  const badges = posterBadges(item)

  const isEpisode = item.Type === 'Episode'
  const playable = item.Type === 'Movie' || isEpisode
  const canFavorite = ['Movie', 'Series', 'Episode'].includes(item.Type)
  const to =
    item.Type === 'BoxSet'
      ? `/collection/${item.Id}`
      : item.Type === 'Person'
        ? `/person/${item.Id}`
        : item.Type === 'Series'
          ? `/series/${item.Id}`
          : isEpisode
            ? `/watch/${item.Id}`
            : `/title/${item.Id}`

  const primaryLabel = isEpisode ? (item.SeriesName ?? item.Name) : item.Name
  const subLabel = isEpisode
    ? [
        item.ParentIndexNumber != null ? `S${item.ParentIndexNumber}` : null,
        item.IndexNumber != null ? `E${item.IndexNumber}` : null,
      ]
        .filter(Boolean)
        .join(':')
    : item.ProductionYear
      ? String(item.ProductionYear)
      : ''

  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link to={to} className="group block w-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface ring-1 ring-line transition duration-300 ease-out-soft group-hover:-translate-y-1 group-hover:shadow-glow group-hover:ring-white/20">
        {tag ? (
          <BlurImage
            src={imageUrl(item.Id, 'Primary', { maxWidth: 320, tag })}
            blurHash={itemBlurHash(item, 'Primary', tag)}
            alt={item.Name}
            imgClassName="transition duration-500 ease-out-soft group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-sm text-neutral-400">
            {item.Name}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {badges.length > 0 && (
          <div className="absolute left-1 top-1 flex flex-wrap gap-1">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/10 backdrop-blur-sm"
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {onDismiss ? (
          <button
            onClick={(e) => {
              stop(e)
              onDismiss(item)
            }}
            aria-label="Remove from Continue Watching"
            className="absolute right-1 top-1 rounded-full bg-black/70 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-black"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        ) : (
          watched && (
            <div className="absolute right-1 top-1 rounded-full bg-accent/90 p-0.5">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </div>
          )
        )}

        {/* Hover quick-actions */}
        {(playable || canFavorite) && (
          <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center gap-2 p-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {playable && (
              <button
                onClick={(e) => {
                  stop(e)
                  navigate(`/watch/${item.Id}`)
                }}
                aria-label="Play"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow transition hover:scale-110"
              >
                <Play className="h-4 w-4 fill-current" />
              </button>
            )}
            {canFavorite && (
              <button
                onClick={(e) => {
                  stop(e)
                  favorite.mutate({ itemId: item.Id, favorite: !isFavorite })
                }}
                aria-label={isFavorite ? 'Remove from My List' : 'Add to My List'}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition hover:bg-white/30"
              >
                {isFavorite ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

        {pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      <div className="mt-2 truncate text-sm font-medium text-neutral-300 transition-colors group-hover:text-white">
        {primaryLabel}
      </div>
      {subLabel && <div className="truncate text-xs text-neutral-500">{subLabel}</div>}
    </Link>
  )
}
