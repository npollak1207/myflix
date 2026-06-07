import { useQuery } from '@tanstack/react-query'
import { getCollections, getItems } from '@/api/jellyfin'

export interface CollectionInfo {
  id: string
  name: string
  items: string[] // member movie ids, in release order
}

// Builds a movieId -> collection map by reading each collection's children once
// (cached). Powers the "Part of X Collection" link and autoplay-next.
export function useCollectionMembership() {
  return useQuery({
    queryKey: ['collectionMembership'],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Record<string, CollectionInfo>> => {
      const collections = await getCollections()
      const byMovie: Record<string, CollectionInfo> = {}
      await Promise.all(
        collections.map(async (c) => {
          const res = await getItems({
            parentId: c.Id,
            recursive: false,
            sortBy: 'PremiereDate,SortName',
            sortOrder: 'Ascending',
          })
          const ids = res.Items.map((i) => i.Id)
          const info: CollectionInfo = { id: c.Id, name: c.Name, items: ids }
          for (const i of res.Items) byMovie[i.Id] = info
        }),
      )
      return byMovie
    },
  })
}
