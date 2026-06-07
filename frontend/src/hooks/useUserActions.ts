import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { clearResume, setFavorite, setPlayed } from '@/api/jellyfin'

// Invalidate the views that depend on user data so toggles reflect everywhere.
function useUserDataInvalidation() {
  const qc = useQueryClient()
  return (itemId: string) => {
    qc.invalidateQueries({ queryKey: ['item', itemId] })
    qc.invalidateQueries({ queryKey: ['favorites'] })
    qc.invalidateQueries({ queryKey: ['resume'] })
    qc.invalidateQueries({ queryKey: ['items'] })
  }
}

export function useToggleFavorite() {
  const invalidate = useUserDataInvalidation()
  return useMutation({
    mutationFn: ({ itemId, favorite }: { itemId: string; favorite: boolean }) =>
      setFavorite(itemId, favorite),
    onSuccess: (_data, { itemId, favorite }) => {
      invalidate(itemId)
      toast.success(favorite ? 'Added to My List' : 'Removed from My List')
    },
  })
}

export function useClearResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => clearResume(itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resume'] }),
  })
}

export function useTogglePlayed() {
  const invalidate = useUserDataInvalidation()
  return useMutation({
    mutationFn: ({ itemId, played }: { itemId: string; played: boolean }) =>
      setPlayed(itemId, played),
    onSuccess: (_data, { itemId, played }) => {
      invalidate(itemId)
      toast.success(played ? 'Marked as watched' : 'Marked as unwatched')
    },
  })
}
