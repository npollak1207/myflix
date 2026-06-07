import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Film, Play, Plus, Star } from 'lucide-react'
import { imageUrl } from '@/api/jellyfin'
import { CastRow } from '@/components/CastRow'
import { MediaBadges } from '@/components/MediaBadges'
import { PosterRow } from '@/components/PosterRow'
import { PageSkeleton } from '@/components/Skeleton'
import { BlurImage } from '@/components/BlurImage'
import { TrailerModal } from '@/components/TrailerModal'
import { useItem, useSimilar } from '@/hooks/useItems'
import { useCollectionMembership } from '@/hooks/useCollectionMembership'
import { useDynamicAura } from '@/hooks/useDynamicAura'
import { useToggleFavorite, useTogglePlayed } from '@/hooks/useUserActions'
import { itemBlurHash } from '@/lib/blurhash'
import { formatRuntime } from '@/lib/format'

export default function Detail() {
  const { id } = useParams()
  const { data: item, isLoading } = useItem(id)
  const { data: similar } = useSimilar(id)
  const { data: membership } = useCollectionMembership()
  const favorite = useToggleFavorite()
  const played = useTogglePlayed()
  const [trailerOpen, setTrailerOpen] = useState(false)
  useDynamicAura(item)

  if (isLoading || !item) return <PageSkeleton />

  const backdropTag = item.BackdropImageTags?.[0]
  const backdrop = backdropTag
    ? imageUrl(item.Id, 'Backdrop', { maxWidth: 1920, tag: backdropTag })
    : undefined
  const logoTag = item.ImageTags?.Logo
  const logo = logoTag ? imageUrl(item.Id, 'Logo', { maxWidth: 480, tag: logoTag }) : undefined
  const hasResume = (item.UserData?.PlaybackPositionTicks ?? 0) > 0
  const isFavorite = !!item.UserData?.IsFavorite
  const isPlayed = !!item.UserData?.Played
  const trailerUrl = item.RemoteTrailers?.[0]?.Url
  const collection = membership?.[item.Id]

  const directors = (item.People ?? []).filter((p) => p.Type === 'Director').map((p) => p.Name)
  const writers = (item.People ?? []).filter((p) => p.Type === 'Writer').map((p) => p.Name)

  return (
    <div className="relative pb-16">
      <div className="relative h-[44vw] max-h-[520px] min-h-[280px] w-full overflow-hidden">
        <BlurImage src={backdrop} blurHash={itemBlurHash(item, 'Backdrop', backdropTag)} alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
      </div>

      <div className="relative z-10 -mt-28 px-4 md:px-12">
        {logo ? (
          <img src={logo} alt={item.Name} className="max-h-24 w-auto max-w-[70%] object-contain drop-shadow-lg" />
        ) : (
          <h1 className="text-3xl font-bold text-white md:text-5xl">{item.Name}</h1>
        )}
        {item.Taglines?.[0] && (
          <p className="mt-2 text-lg italic text-neutral-400">{item.Taglines[0]}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
          {item.ProductionYear && <span>{item.ProductionYear}</span>}
          {item.RunTimeTicks && <span>{formatRuntime(item.RunTimeTicks)}</span>}
          {item.OfficialRating && (
            <span className="rounded-md bg-white/5 px-2 py-0.5 ring-1 ring-line">
              {item.OfficialRating}
            </span>
          )}
          {item.CommunityRating && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {item.CommunityRating.toFixed(1)}
            </span>
          )}
          {item.CriticRating != null && (
            <span className="text-green-400">{Math.round(item.CriticRating)}% critics</span>
          )}
          <MediaBadges item={item} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={`/watch/${item.Id}`}
            className="flex items-center gap-2 rounded-full bg-white px-7 py-2.5 font-semibold text-black shadow-lg transition hover:scale-[1.03] hover:bg-white/90"
          >
            <Play className="h-5 w-5 fill-current" /> {hasResume ? 'Resume' : 'Play'}
          </Link>
          {trailerUrl && (
            <button
              onClick={() => setTrailerOpen(true)}
              className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-medium text-white ring-1 ring-line backdrop-blur-md transition hover:bg-white/20"
            >
              <Film className="h-5 w-5" /> Trailer
            </button>
          )}
          <button
            onClick={() => favorite.mutate({ itemId: item.Id, favorite: !isFavorite })}
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
          <button
            onClick={() => played.mutate({ itemId: item.Id, played: !isPlayed })}
            disabled={played.isPending}
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-medium text-white ring-1 ring-line backdrop-blur-md transition hover:bg-white/20"
            title={isPlayed ? 'Mark as unwatched' : 'Mark as watched'}
          >
            <Check className={`h-5 w-5 ${isPlayed ? 'text-accent-soft' : 'text-neutral-400'}`} />
            {isPlayed ? 'Watched' : 'Mark watched'}
          </button>
        </div>

        {collection && (
          <Link
            to={`/collection/${collection.id}`}
            className="mt-4 inline-block text-sm text-neutral-400 hover:text-white"
          >
            Part of the <span className="text-white">{collection.name}</span> →
          </Link>
        )}

        {item.Genres && item.Genres.length > 0 && (
          <div className="mt-4 text-sm text-neutral-400">{item.Genres.join(' · ')}</div>
        )}
        {item.Overview && <p className="mt-4 max-w-3xl text-neutral-200">{item.Overview}</p>}

        <div className="mt-4 space-y-1 text-sm text-neutral-400">
          {directors.length > 0 && (
            <div>
              <span className="text-neutral-500">Director: </span>
              {directors.join(', ')}
            </div>
          )}
          {writers.length > 0 && (
            <div>
              <span className="text-neutral-500">Writers: </span>
              {writers.slice(0, 4).join(', ')}
            </div>
          )}
          {item.Studios && item.Studios.length > 0 && (
            <div>
              <span className="text-neutral-500">Studio: </span>
              {item.Studios.map((s) => s.Name).join(', ')}
            </div>
          )}
        </div>

        {item.People && <CastRow people={item.People} />}

        {similar && similar.length > 0 && (
          <div className="mt-10 -mx-4 md:-mx-12">
            <PosterRow title="More Like This" items={similar} />
          </div>
        )}
      </div>

      {trailerOpen && trailerUrl && (
        <TrailerModal url={trailerUrl} onClose={() => setTrailerOpen(false)} />
      )}
    </div>
  )
}
