import { X } from 'lucide-react'

function youTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  return m ? m[1] : null
}

export function TrailerModal({ url, onClose }: { url: string; onClose: () => void }) {
  const id = youTubeId(url)
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div className="relative aspect-video w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close trailer"
          className="absolute -top-10 right-0 rounded bg-black/60 p-1.5 text-white hover:bg-black"
        >
          <X className="h-5 w-5" />
        </button>
        {id ? (
          <iframe
            className="h-full w-full rounded"
            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
            title="Trailer"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        ) : (
          <a href={url} target="_blank" rel="noreferrer" className="text-white underline">
            Open trailer in a new tab
          </a>
        )}
      </div>
    </div>
  )
}
