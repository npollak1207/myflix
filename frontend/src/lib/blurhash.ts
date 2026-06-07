import { decode } from 'blurhash'
import type { BaseItemDto } from '@/api/types'

const cache = new Map<string, string>()

// Decode a BlurHash into a tiny data-URL we can use as an instant placeholder.
export function blurHashToDataUrl(hash?: string, width = 32, height = 48): string | undefined {
  if (!hash) return undefined
  const key = `${hash}:${width}x${height}`
  const hit = cache.get(key)
  if (hit) return hit
  try {
    const pixels = decode(hash, width, height)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    const imageData = ctx.createImageData(width, height)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
    const url = canvas.toDataURL()
    cache.set(key, url)
    return url
  } catch {
    return undefined
  }
}

// The 1x1 decode of a BlurHash is its average color — handy for theming.
export function blurHashAverageColor(hash?: string): [number, number, number] | undefined {
  if (!hash) return undefined
  try {
    const px = decode(hash, 1, 1)
    return [px[0], px[1], px[2]]
  } catch {
    return undefined
  }
}

// Pull the BlurHash for a given image type off an item (keyed by image tag).
export function itemBlurHash(
  item: BaseItemDto,
  type: 'Primary' | 'Backdrop' | 'Thumb' = 'Primary',
  tag?: string,
): string | undefined {
  const hashes = item.ImageBlurHashes?.[type]
  if (!hashes) return undefined
  if (tag && hashes[tag]) return hashes[tag]
  return Object.values(hashes)[0]
}
