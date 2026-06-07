import { useParams } from 'react-router-dom'
import { imageUrl } from '@/api/jellyfin'
import { PosterCard } from '@/components/PosterCard'
import { PageSkeleton } from '@/components/Skeleton'
import { useItem, useItems } from '@/hooks/useItems'

export default function Collection() {
  const { id } = useParams()
  const { data: collection, isLoading } = useItem(id)
  // Children of a BoxSet, in release order so franchises read chronologically.
  const { data: items } = useItems({
    parentId: id,
    recursive: false,
    sortBy: 'PremiereDate,SortName',
    sortOrder: 'Ascending',
    fields: 'MediaStreams',
  })

  if (isLoading || !collection) return <PageSkeleton />

  const backdropTag = collection.BackdropImageTags?.[0]
  const backdrop = backdropTag
    ? imageUrl(collection.Id, 'Backdrop', { maxWidth: 1920, tag: backdropTag })
    : undefined
  const movies = items?.Items ?? []

  return (
    <div className="pb-16">
      <div className="relative h-[36vw] max-h-[420px] min-h-[220px] w-full">
        {backdrop && (
          <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div className="absolute bottom-6 left-4 md:left-12">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {collection.Name}
          </h1>
          <p className="mt-1 text-sm text-neutral-300">{movies.length} titles</p>
        </div>
      </div>
      {collection.Overview && (
        <p className="max-w-3xl px-4 pt-4 text-neutral-300 md:px-12">{collection.Overview}</p>
      )}
      <div className="grid grid-cols-3 gap-4 px-4 py-8 sm:grid-cols-4 md:grid-cols-6 md:px-12 lg:grid-cols-8">
        {movies.map((item) => (
          <PosterCard key={item.Id} item={item} />
        ))}
      </div>
    </div>
  )
}
