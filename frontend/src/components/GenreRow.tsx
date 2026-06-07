import { useItems } from '@/hooks/useItems'
import { PosterRow } from './PosterRow'

// A poster row populated by one genre, shuffled for variety on each visit.
export function GenreRow({ genreId, genreName }: { genreId: string; genreName: string }) {
  const { data } = useItems({
    genreIds: genreId,
    includeItemTypes: 'Movie',
    recursive: true,
    sortBy: 'Random',
    limit: 20,
  })
  return <PosterRow title={genreName} items={data?.Items ?? []} />
}
