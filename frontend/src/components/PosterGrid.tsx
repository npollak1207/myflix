import { useEffect, useRef } from 'react'
import { PosterCard } from './PosterCard'
import { PosterGridSkeleton } from './Skeleton'
import { useInfiniteItems } from '@/hooks/useInfiniteItems'
import type { ItemQuery } from '@/api/jellyfin'

// Clean responsive grid with infinite-scroll pagination (loads 100 at a time).
export function PosterGrid({ query, emptyText }: { query: ItemQuery; emptyText?: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteItems(query)
  const items = data?.pages.flatMap((p) => p.Items) ?? []
  const total = data?.pages[0]?.TotalRecordCount ?? 0

  const sentinel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) void fetchNextPage()
      },
      { rootMargin: '800px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <PosterGridSkeleton />
  if (items.length === 0) {
    return <p className="text-neutral-400">{emptyText ?? 'Nothing here.'}</p>
  }

  return (
    <div>
      <div className="mb-4 text-sm text-neutral-500">{total} titles</div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 md:gap-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
        {items.map((item) => (
          <PosterCard key={item.Id} item={item} />
        ))}
      </div>
      <div ref={sentinel} className="h-10" />
      {isFetchingNextPage && (
        <div className="py-6 text-center text-sm text-neutral-500">Loading more…</div>
      )}
    </div>
  )
}
