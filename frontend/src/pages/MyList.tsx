import { Heart } from 'lucide-react'
import { PosterCard } from '@/components/PosterCard'
import { EmptyState } from '@/components/EmptyState'
import { PosterGridSkeleton } from '@/components/Skeleton'
import { useFavorites } from '@/hooks/useItems'

export default function MyList() {
  const { data, isLoading } = useFavorites()

  if (isLoading) return <PosterGridSkeleton />

  const items = data?.Items ?? []

  return (
    <div className="px-4 py-8 md:px-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-white">My List</h1>
      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your list is empty"
          subtitle="Tap the + on any title to save it here for later."
        />
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {items.map((item) => (
            <PosterCard key={item.Id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
