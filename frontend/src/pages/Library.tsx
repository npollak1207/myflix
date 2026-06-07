import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PosterGrid } from '@/components/PosterGrid'
import { useGenres } from '@/hooks/useItems'
import { useLibraries } from '@/hooks/useLibraries'
import type { ItemQuery } from '@/api/jellyfin'

// A library's CollectionType decides what item types it holds. The auto-created
// "Collections" view holds BoxSets, not movies — so we must not filter those out.
function itemTypesFor(collectionType?: string): string {
  switch (collectionType) {
    case 'boxsets':
      return 'BoxSet'
    case 'movies':
      return 'Movie'
    case 'tvshows':
      return 'Series'
    default:
      return 'Movie,Series'
  }
}

const SORTS = [
  { label: 'Title (A–Z)', sortBy: 'SortName', sortOrder: 'Ascending' as const },
  { label: 'Newest', sortBy: 'DateCreated', sortOrder: 'Descending' as const },
  { label: 'Release date', sortBy: 'PremiereDate', sortOrder: 'Descending' as const },
  { label: 'Rating', sortBy: 'CommunityRating', sortOrder: 'Descending' as const },
  { label: 'Runtime', sortBy: 'Runtime', sortOrder: 'Descending' as const },
]

const selectClass =
  'rounded-lg bg-white/5 px-3 py-1.5 text-sm text-neutral-200 ring-1 ring-line outline-none transition hover:bg-white/10 focus:ring-2 focus:ring-accent/70'

const DECADES = [2020, 2010, 2000, 1990, 1980, 1970]
const yearsInDecade = (start: number) => Array.from({ length: 10 }, (_, i) => start + i).join(',')

export default function Library() {
  const { id } = useParams()
  const [sortIdx, setSortIdx] = useState(0)
  const [genreId, setGenreId] = useState('')
  const [decade, setDecade] = useState(0)
  const [unwatchedOnly, setUnwatchedOnly] = useState(false)

  const { data: libraries } = useLibraries()
  const library = libraries?.find((l) => l.Id === id)
  const isBoxSets = library?.CollectionType === 'boxsets'

  const { data: genres } = useGenres(id)
  const sort = SORTS[sortIdx]

  const query: ItemQuery = {
    parentId: id,
    includeItemTypes: itemTypesFor(library?.CollectionType),
    recursive: true,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    genreIds: genreId || undefined,
    years: decade ? yearsInDecade(decade) : undefined,
    filters: unwatchedOnly ? 'IsUnplayed' : undefined,
    fields: 'MediaStreams',
  }

  return (
    <div className="px-4 py-8 md:px-12">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={sortIdx}
          onChange={(e) => setSortIdx(Number(e.target.value))}
          className={selectClass}
        >
          {SORTS.map((s, i) => (
            <option key={s.label} value={i}>
              {s.label}
            </option>
          ))}
        </select>
        {!isBoxSets && (
          <>
            <select
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
              className={selectClass}
            >
              <option value="">All genres</option>
              {genres?.map((g) => (
                <option key={g.Id} value={g.Id}>
                  {g.Name}
                </option>
              ))}
            </select>
            <select
              value={decade}
              onChange={(e) => setDecade(Number(e.target.value))}
              className={selectClass}
            >
              <option value={0}>Any decade</option>
              {DECADES.map((d) => (
                <option key={d} value={d}>
                  {d}s
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={unwatchedOnly}
                onChange={(e) => setUnwatchedOnly(e.target.checked)}
                className="accent-accent"
              />
              Unwatched only
            </label>
          </>
        )}
      </div>

      <PosterGrid query={query} emptyText="No titles match these filters." />
    </div>
  )
}
