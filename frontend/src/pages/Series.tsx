import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, Play, Plus } from 'lucide-react'
import { imageUrl } from '@/api/jellyfin'
import { BlurImage } from '@/components/BlurImage'
import { PageSkeleton } from '@/components/Skeleton'
import { useEpisodes, useItem, useSeasons } from '@/hooks/useItems'
import { useToggleFavorite } from '@/hooks/useUserActions'
import { useDynamicAura } from '@/hooks/useDynamicAura'
import { itemBlurHash } from '@/lib/blurhash'
import { formatRuntime } from '@/lib/format'
import type { BaseItemDto } from '@/api/types'

function EpisodeRow({ ep }: { ep: BaseItemDto }) {
  const navigate = useNavigate()
  const tag = ep.ImageTags?.Primary
  const pct =
    ep.UserData?.PlaybackPositionTicks && ep.RunTimeTicks
      ? Math.min(100, (ep.UserData.PlaybackPositionTicks / ep.RunTimeTicks) * 100)
      : 0
  return (
    <button
      onClick={() => navigate(`/watch/${ep.Id}`)}
      className="group flex w-full gap-4 rounded-xl p-2 text-left transition hover:bg-white/5"
    >
      <div className="relative aspect-video w-44 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-line">
        {tag ? (
          <BlurImage
            src={imageUrl(ep.Id, 'Primary', { maxWidth: 384, tag })}
            blurHash={itemBlurHash(ep, 'Primary', tag)}
            alt={ep.Name}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
          <Play className="h-8 w-8 fill-white text-white drop-shadow" />
        </div>
        {ep.UserData?.Played && (
          <div className="absolute right-1 top-1 rounded-full bg-accent/90 p-0.5">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        )}
        {pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span className="text-neutral-500">{ep.IndexNumber != null ? `E${ep.IndexNumber}` : ''}</span>
          <span className="truncate">{ep.Name}</span>
          {ep.RunTimeTicks && (
            <span className="ml-auto shrink-0 text-xs text-neutral-500">
              {formatRuntime(ep.RunTimeTicks)}
            </span>
          )}
        </div>
        {ep.Overview && (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-400">{ep.Overview}</p>
        )}
      </div>
    </button>
  )
}

export default function Series() {
  const { id } = useParams()
  const { data: series, isLoading } = useItem(id)
  const { data: seasons } = useSeasons(id)
  const [seasonId, setSeasonId] = useState<string>()
  useEffect(() => {
    if (seasons?.length && !seasonId) setSeasonId(seasons[0].Id)
  }, [seasons, seasonId])
  const { data: episodes } = useEpisodes(id, seasonId)
  const favorite = useToggleFavorite()
  useDynamicAura(series)

  if (isLoading || !series) return <PageSkeleton />

  const backdropTag = series.BackdropImageTags?.[0]
  const backdrop = backdropTag
    ? imageUrl(series.Id, 'Backdrop', { maxWidth: 1920, tag: backdropTag })
    : undefined
  const logoTag = series.ImageTags?.Logo
  const logo = logoTag ? imageUrl(series.Id, 'Logo', { maxWidth: 480, tag: logoTag }) : undefined
  const isFavorite = !!series.UserData?.IsFavorite
  const firstEpisode = episodes?.[0]

  return (
    <div className="relative pb-16">
      <div className="relative h-[44vw] max-h-[520px] min-h-[280px] w-full overflow-hidden">
        <BlurImage src={backdrop} blurHash={itemBlurHash(series, 'Backdrop', backdropTag)} alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
      </div>

      <div className="relative z-10 -mt-28 px-4 md:px-12">
        {logo ? (
          <img src={logo} alt={series.Name} className="max-h-24 w-auto max-w-[70%] object-contain drop-shadow-lg" />
        ) : (
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{series.Name}</h1>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
          {series.ProductionYear && <span>{series.ProductionYear}</span>}
          {series.OfficialRating && (
            <span className="rounded-md bg-white/5 px-2 py-0.5 ring-1 ring-line">
              {series.OfficialRating}
            </span>
          )}
          {series.CommunityRating && <span>★ {series.CommunityRating.toFixed(1)}</span>}
          {seasons && <span>{seasons.length} season{seasons.length === 1 ? '' : 's'}</span>}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {firstEpisode && (
            <Link
              to={`/watch/${firstEpisode.Id}`}
              className="flex items-center gap-2 rounded-full bg-white px-7 py-2.5 font-semibold text-black shadow-lg transition hover:scale-[1.03] hover:bg-white/90"
            >
              <Play className="h-5 w-5 fill-current" /> Play
            </Link>
          )}
          <button
            onClick={() => favorite.mutate({ itemId: series.Id, favorite: !isFavorite })}
            disabled={favorite.isPending}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-medium ring-1 backdrop-blur-md transition ${
              isFavorite
                ? 'bg-accent/20 text-white ring-accent/50'
                : 'bg-white/10 text-white ring-line hover:bg-white/20'
            }`}
          >
            {isFavorite ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isFavorite ? 'In My List' : 'My List'}
          </button>
        </div>

        {series.Genres && series.Genres.length > 0 && (
          <div className="mt-4 text-sm text-neutral-400">{series.Genres.join(' · ')}</div>
        )}
        {series.Overview && <p className="mt-4 max-w-3xl text-neutral-200">{series.Overview}</p>}

        <div className="mt-8 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Episodes</h2>
          {seasons && seasons.length > 0 && (
            <select
              value={seasonId ?? ''}
              onChange={(e) => setSeasonId(e.target.value)}
              className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-neutral-200 ring-1 ring-line outline-none transition hover:bg-white/10 focus:ring-2 focus:ring-accent/70"
            >
              {seasons.map((s) => (
                <option key={s.Id} value={s.Id}>
                  {s.Name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-4 max-w-4xl space-y-1">
          {(episodes ?? []).map((ep) => (
            <EpisodeRow key={ep.Id} ep={ep} />
          ))}
        </div>
      </div>
    </div>
  )
}
