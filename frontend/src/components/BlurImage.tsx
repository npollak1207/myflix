import { useMemo, useState } from 'react'
import { blurHashToDataUrl } from '@/lib/blurhash'

interface Props {
  src?: string
  blurHash?: string
  alt?: string
  /** Extra classes applied to the real <img> (e.g. hover scale). */
  imgClassName?: string
}

// Renders a BlurHash placeholder, then cross-fades to the real image once loaded.
// Expects a positioned (relative) parent that defines the box size.
export function BlurImage({ src, blurHash, alt = '', imgClassName }: Props) {
  const [loaded, setLoaded] = useState(false)
  const placeholder = useMemo(() => blurHashToDataUrl(blurHash), [blurHash])

  return (
    <>
      {placeholder && (
        <img
          src={placeholder}
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName ?? ''}`}
        />
      )}
    </>
  )
}
