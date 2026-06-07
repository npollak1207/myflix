import { useEffect } from 'react'
import { blurHashAverageColor, itemBlurHash } from '@/lib/blurhash'
import type { BaseItemDto } from '@/api/types'

// Tints the page's ambient aura to the dominant color of the given title's
// artwork (derived from its BlurHash), so the UI subtly "wears" the content.
export function useDynamicAura(item?: BaseItemDto) {
  useEffect(() => {
    if (!item) return
    const hash =
      itemBlurHash(item, 'Backdrop', item.BackdropImageTags?.[0]) ??
      itemBlurHash(item, 'Primary', item.ImageTags?.Primary)
    const rgb = blurHashAverageColor(hash)
    if (!rgb) return
    const [r, g, b] = rgb
    document.body.style.setProperty('--aura-1', `rgba(${r}, ${g}, ${b}, 0.3)`)
    document.body.style.setProperty('--aura-2', `rgba(${r}, ${g}, ${b}, 0.16)`)
    return () => {
      document.body.style.removeProperty('--aura-1')
      document.body.style.removeProperty('--aura-2')
    }
  }, [item])
}
