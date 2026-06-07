import { useQuery } from '@tanstack/react-query'
import { getViews } from '@/api/jellyfin'

export function useLibraries() {
  return useQuery({ queryKey: ['views'], queryFn: getViews })
}
