// Lightweight skeleton placeholders that mirror the poster grid/row layouts.

function PosterSkeleton() {
  return (
    <div className="w-full">
      <div className="shimmer aspect-[2/3] rounded-xl ring-1 ring-line" />
      <div className="shimmer mt-2 h-3 w-3/4 rounded" />
    </div>
  )
}

export function PosterRowSkeleton({ title }: { title?: string }) {
  return (
    <section className="mb-8">
      {title && (
        <h2 className="mb-3 px-4 text-base font-semibold tracking-tight text-white/90 md:px-12">
          {title}
        </h2>
      )}
      <div className="flex gap-3 px-4 md:gap-4 md:px-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-32 shrink-0 sm:w-36 md:w-44">
            <PosterSkeleton />
          </div>
        ))}
      </div>
    </section>
  )
}

export function PosterGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 py-8 sm:grid-cols-4 md:grid-cols-6 md:px-12 lg:grid-cols-8">
      {Array.from({ length: count }).map((_, i) => (
        <PosterSkeleton key={i} />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="pb-16">
      <div className="shimmer h-[44vw] max-h-[520px] min-h-[280px] w-full" />
      <div className="-mt-12">
        <PosterRowSkeleton />
        <PosterRowSkeleton />
      </div>
    </div>
  )
}
