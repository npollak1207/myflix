import { useParams } from 'react-router-dom'
import { imageUrl } from '@/api/jellyfin'
import { PosterCard } from '@/components/PosterCard'
import { PageSkeleton, PosterGridSkeleton } from '@/components/Skeleton'
import { useItems, usePerson } from '@/hooks/useItems'

export default function Person() {
  const { id } = useParams()
  const { data: person, isLoading } = usePerson(id)
  const { data: films, isLoading: filmsLoading } = useItems({
    personIds: id,
    includeItemTypes: 'Movie,Series',
    recursive: true,
    sortBy: 'PremiereDate',
    sortOrder: 'Descending',
    fields: 'MediaStreams',
  })

  if (isLoading || !person) return <PageSkeleton />

  const tag = person.ImageTags?.Primary
  const img = tag ? imageUrl(person.Id, 'Primary', { maxWidth: 400, tag }) : undefined

  return (
    <div className="px-4 py-8 md:px-12">
      <div className="flex gap-6">
        <div className="h-48 w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
          {img && <img src={img} alt={person.Name} className="h-full w-full object-cover" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">{person.Name}</h1>
          {person.Overview && (
            <p className="mt-3 line-clamp-6 max-w-3xl text-sm text-neutral-300">{person.Overview}</p>
          )}
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-white">Filmography</h2>
      {filmsLoading ? (
        <PosterGridSkeleton count={12} />
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {(films?.Items ?? []).map((item) => (
            <PosterCard key={item.Id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
