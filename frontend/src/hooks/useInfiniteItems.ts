import { useInfiniteQuery } from '@tanstack/react-query'
import { getItems, type ItemQuery } from '@/api/jellyfin'

const PAGE_SIZE = 100

// Paginates a library query (StartIndex/Limit) for use with the virtual grid.
export function useInfiniteItems(query: ItemQuery) {
  return useInfiniteQuery({
    queryKey: ['infinite-items', query],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getItems({ ...query, startIndex: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.Items.length, 0)
      return loaded < lastPage.TotalRecordCount ? loaded : undefined
    },
  })
}
