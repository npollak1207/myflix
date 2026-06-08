import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { PosterCard } from './PosterCard'
import { PosterGridSkeleton } from './Skeleton'
import { useInfiniteItems } from '@/hooks/useInfiniteItems'
import type { ItemQuery } from '@/api/jellyfin'

// Responsive column count, mirroring the Tailwind breakpoints the grid used
// before virtualization so the layout is visually unchanged.
function columnsForWidth(w: number): number {
  if (w >= 1536) return 8 // 2xl
  if (w >= 1280) return 7 // xl
  if (w >= 1024) return 6 // lg
  if (w >= 768) return 5 // md
  if (w >= 640) return 4 // sm
  return 3
}

const GAP = 20 // px, matches gap-5

// Virtualized, infinite-scrolling poster grid. Only the visible rows are
// mounted, so libraries with thousands of titles stay smooth. Scrolling is
// driven by the window, so the page chrome (navbar) behaves normally.
export function PosterGrid({ query, emptyText }: { query: ItemQuery; emptyText?: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteItems(query)
  const items = data?.pages.flatMap((p) => p.Items) ?? []
  const total = data?.pages[0]?.TotalRecordCount ?? 0

  const parentRef = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(() =>
    columnsForWidth(typeof window === 'undefined' ? 1280 : window.innerWidth),
  )
  const [width, setWidth] = useState(0)
  const [offset, setOffset] = useState(0)

  // Track container width (for row-height math) and viewport width (for columns).
  useLayoutEffect(() => {
    const el = parentRef.current
    if (!el) return
    const measure = () => {
      setWidth(el.clientWidth)
      setOffset(el.offsetTop)
      setCols(columnsForWidth(window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const rowCount = Math.ceil(items.length / cols)
  // Cell width → poster height (aspect 2/3) + ~46px for the two text lines.
  const cellWidth = width > 0 ? (width - GAP * (cols - 1)) / cols : 200
  const rowHeight = cellWidth * 1.5 + 46 + GAP

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => rowHeight,
    overscan: 4,
    scrollMargin: offset,
  })

  // Infinite scroll: fetch the next page once the last row is within the
  // overscan window (replaces the old IntersectionObserver sentinel).
  const virtualRows = rowVirtualizer.getVirtualItems()
  const lastRow = virtualRows[virtualRows.length - 1]
  useEffect(() => {
    if (lastRow && lastRow.index >= rowCount - 1 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [lastRow, rowCount, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <PosterGridSkeleton />
  if (items.length === 0) {
    return <p className="text-neutral-400">{emptyText ?? 'Nothing here.'}</p>
  }

  return (
    <div>
      <div className="mb-4 text-sm text-neutral-500">{total} titles</div>
      <div ref={parentRef} style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {virtualRows.map((virtualRow) => {
          const start = virtualRow.index * cols
          const rowItems = items.slice(start, start + cols)
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: GAP,
                paddingBottom: GAP,
              }}
            >
              {rowItems.map((item) => (
                <PosterCard key={item.Id} item={item} />
              ))}
            </div>
          )
        })}
      </div>
      {isFetchingNextPage && (
        <div className="py-6 text-center text-sm text-neutral-500">Loading more…</div>
      )}
    </div>
  )
}
