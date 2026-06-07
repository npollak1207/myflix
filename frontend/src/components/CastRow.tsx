import { Link } from 'react-router-dom'
import { imageUrl } from '@/api/jellyfin'
import type { Person } from '@/api/types'

export function CastRow({ people }: { people: Person[] }) {
  // Cast first, capped — directors/writers are shown separately on the detail page.
  const cast = people.filter((p) => p.Type === 'Actor').slice(0, 20)
  if (cast.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-white">Cast</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {cast.map((p) => (
          <Link key={p.Id} to={`/person/${p.Id}`} className="group w-24 shrink-0 text-center">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-surface ring-1 ring-line transition group-hover:ring-2 group-hover:ring-accent/60">
              {p.PrimaryImageTag ? (
                <img
                  src={imageUrl(p.Id, 'Primary', { maxWidth: 192, tag: p.PrimaryImageTag })}
                  alt={p.Name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl text-neutral-500">
                  {p.Name.charAt(0)}
                </div>
              )}
            </div>
            <div className="mt-2 truncate text-sm text-neutral-200" title={p.Name}>
              {p.Name}
            </div>
            {p.Role && (
              <div className="truncate text-xs text-neutral-500" title={p.Role}>
                {p.Role}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
