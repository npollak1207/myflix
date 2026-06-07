import { useQuery } from '@tanstack/react-query'
import {
  getCollections,
  getGenres,
  getItem,
  getItems,
  getEpisodes,
  getLatest,
  getNextUp,
  getPerson,
  getResumeItems,
  getSeasons,
  getSimilar,
  getSuggestions,
  type ItemQuery,
} from '@/api/jellyfin'

export const useResume = () =>
  useQuery({ queryKey: ['resume'], queryFn: getResumeItems })

export const useLatest = (parentId?: string) =>
  useQuery({ queryKey: ['latest', parentId], queryFn: () => getLatest(parentId) })

export const useItems = (query: ItemQuery) =>
  useQuery({ queryKey: ['items', query], queryFn: () => getItems(query) })

export const useItem = (id: string | undefined) =>
  useQuery({ queryKey: ['item', id], queryFn: () => getItem(id!), enabled: !!id })

export const useSimilar = (id: string | undefined) =>
  useQuery({ queryKey: ['similar', id], queryFn: () => getSimilar(id!), enabled: !!id })

export const useCollections = () =>
  useQuery({ queryKey: ['collections'], queryFn: getCollections })

export const useSuggestions = () =>
  useQuery({ queryKey: ['suggestions'], queryFn: () => getSuggestions() })

export const useNextUp = () => useQuery({ queryKey: ['nextup'], queryFn: () => getNextUp() })

export const useSeasons = (seriesId: string | undefined) =>
  useQuery({ queryKey: ['seasons', seriesId], queryFn: () => getSeasons(seriesId!), enabled: !!seriesId })

export const useEpisodes = (seriesId: string | undefined, seasonId: string | undefined) =>
  useQuery({
    queryKey: ['episodes', seriesId, seasonId],
    queryFn: () => getEpisodes(seriesId!, seasonId!),
    enabled: !!seriesId && !!seasonId,
  })

export const usePerson = (id: string | undefined) =>
  useQuery({ queryKey: ['person', id], queryFn: () => getPerson(id!), enabled: !!id })

export const useFavorites = () =>
  useQuery({
    queryKey: ['favorites'],
    queryFn: () =>
      getItems({ filters: 'IsFavorite', includeItemTypes: 'Movie,Series', recursive: true, sortBy: 'SortName' }),
  })

export const useGenres = (parentId?: string) =>
  useQuery({ queryKey: ['genres', parentId], queryFn: () => getGenres(parentId) })

export const useSearch = (term: string) =>
  useQuery({
    queryKey: ['search', term],
    // No sortBy → Jellyfin returns results in relevance order.
    queryFn: () =>
      getItems({ searchTerm: term, includeItemTypes: 'Movie,Series', recursive: true, limit: 60 }),
    enabled: term.trim().length > 0,
  })
