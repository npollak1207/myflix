import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/api/client'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // 401 is handled by AuthContext (redirect to login) — don't double-notify.
      if (error instanceof ApiError && error.status === 401) return
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
