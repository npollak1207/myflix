import { useEffect, useMemo, useState } from 'react'
import { Hero } from '@/components/Hero'
import { GenreRow } from '@/components/GenreRow'
import { PosterRow } from '@/components/PosterRow'
import { LandscapeRow } from '@/components/LandscapeRow'
import { TopTenRow } from '@/components/TopTenRow'
import { PageSkeleton } from '@/components/Skeleton'
import {
  useCollections,
  useFavorites,
  useGenres,
  useItems,
  useLatest,
  useNextUp,
  useResume,
  useSimilar,
  useSuggestions,
} from '@/hooks/useItems'
import { useLibraries } from '@/hooks/useLibraries'
import { useClearResume } from '@/hooks/useUserActions'
import type { BaseItemDto } from '@/api/types'

const HERO_ROTATE_MS = 9000

function useRotatingHero(candidates: BaseItemDto[]): BaseItemDto | undefined {
  const withBackdrop = useMemo(
    () => candidates.filter((c) => (c.BackdropImageTags?.length ?? 0) > 0),
    [candidates],
  )
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (withBackdrop.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % withBackdrop.length), HERO_ROTATE_MS)
    return () => clearInterval(t)
  }, [withBackdrop.length])
  return withBackdrop[index % Math.max(1, withBackdrop.length)]
}

export default function Home() {
  const { data: resume } = useResume()
  const { data: libraries, isLoading } = useLibraries()
  const movieLib = libraries?.find((l) => l.CollectionType === 'movies')

  const { data: latest } = useLatest(movieLib?.Id)
  const { data: featured } = useItems({
    includeItemTypes: 'Movie',
    recursive: true,
    sortBy: 'Random',
    limit: 12,
  })
  const { data: topTen } = useItems({
    includeItemTypes: 'Movie',
    recursive: true,
    sortBy: 'CommunityRating,SortName',
    sortOrder: 'Descending',
    limit: 10,
  })
  const { data: genres } = useGenres(movieLib?.Id)
  const { data: collections } = useCollections()
  const { data: favorites } = useFavorites()
  const { data: suggestions } = useSuggestions()
  const { data: nextUp } = useNextUp()
  const clearResume = useClearResume()

  // "Because you watched" anchors on the most recent in-progress title.
  const anchor = resume?.[0]
  const { data: because } = useSimilar(anchor?.Id)

  const hero = useRotatingHero(featured?.Items ?? [])

  if (isLoading) return <PageSkeleton />

  return (
    <div className="pb-16">
      {hero && <Hero item={hero} />}
      <div className={`relative z-10 ${hero ? '-mt-12' : 'pt-6'}`}>
        <LandscapeRow
          title="Continue Watching"
          items={resume ?? []}
          onDismiss={(it) => clearResume.mutate(it.Id)}
        />
        <LandscapeRow title="Next Up" items={nextUp ?? []} />
        <TopTenRow title="Top 10 Movies" items={topTen?.Items ?? []} />
        <PosterRow title="My List" items={favorites?.Items ?? []} />
        {anchor && because && (
          <PosterRow title={`Because you watched ${anchor.Name}`} items={because} />
        )}
        <PosterRow title="Top Picks for You" items={suggestions ?? []} />
        <PosterRow title="Recently Added" items={latest ?? []} />
        <PosterRow title="Collections" items={collections ?? []} />
        {genres?.map((g) => (
          <GenreRow key={g.Id} genreId={g.Id} genreName={g.Name} />
        ))}
      </div>
    </div>
  )
}
