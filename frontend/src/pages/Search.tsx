import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SearchX } from 'lucide-react'
import { PosterCard } from '@/components/PosterCard'
import { EmptyState } from '@/components/EmptyState'
import { PosterGridSkeleton } from '@/components/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearch } from '@/hooks/useItems'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const debounced = useDebounce(q, 300)
  const { data, isFetching } = useSearch(debounced)
  const items = data?.Items ?? []

  return (
    <div className="px-4 py-6 md:px-12 md:py-8">
      {/* On-page search field (primary entry point on mobile) */}
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-line focus-within:ring-accent/60">
        <SearchIcon className="h-5 w-5 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
          autoFocus
          placeholder="Search movies, shows, people…"
          className="w-full bg-transparent text-base text-white outline-none placeholder:text-neutral-500"
        />
      </div>

      {!q.trim() ? (
        <EmptyState
          icon={SearchIcon}
          title="Search your library"
          subtitle="Find movies, shows, collections, and cast."
        />
      ) : isFetching ? (
        <PosterGridSkeleton count={12} />
      ) : items.length === 0 ? (
        <EmptyState icon={SearchX} title={`No results for “${q}”`} subtitle="Try a different title or name." />
      ) : (
        <>
          <div className="mb-4 text-sm text-neutral-400">
            {items.length} result{items.length === 1 ? '' : 's'} for “{q}”
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {items.map((item) => (
              <PosterCard key={item.Id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
