import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Info, Play } from 'lucide-react'
import { imageUrl } from '@/api/jellyfin'
import { blurHashToDataUrl, itemBlurHash } from '@/lib/blurhash'
import { useDynamicAura } from '@/hooks/useDynamicAura'
import type { BaseItemDto } from '@/api/types'

export function Hero({ item }: { item: BaseItemDto }) {
  useDynamicAura(item)
  const { scrollY } = useScroll()
  const parallax = useTransform(scrollY, [0, 600], [0, 80])
  const fade = useTransform(scrollY, [0, 420], [1, 0])

  const tag = item.BackdropImageTags?.[0]
  const bg = tag ? imageUrl(item.Id, 'Backdrop', { maxWidth: 1920, tag }) : undefined
  const placeholder = blurHashToDataUrl(itemBlurHash(item, 'Backdrop', tag), 32, 18)
  const logoTag = item.ImageTags?.Logo
  const logo = logoTag ? imageUrl(item.Id, 'Logo', { maxWidth: 480, tag: logoTag }) : undefined

  return (
    <div className="grain relative h-[62vw] max-h-[760px] min-h-[420px] w-full overflow-hidden">
      <motion.div style={{ y: parallax }} className="absolute inset-0">
        {placeholder && (
          <img src={placeholder} aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        )}
        <AnimatePresence>
          <motion.img
            key={item.Id}
            src={bg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            className="animate-kenburns absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <motion.div
        style={{ opacity: fade }}
        className="absolute bottom-[12%] left-4 max-w-2xl md:left-12"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={item.Id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {logo ? (
              <img
                src={logo}
                alt={item.Name}
                className="mb-2 max-h-32 w-auto max-w-[85%] object-contain drop-shadow-2xl"
              />
            ) : (
              <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-xl md:text-6xl">
                {item.Name}
              </h1>
            )}
            {item.Overview && (
              <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
                {item.Overview}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex gap-3">
          <Link
            to={`/watch/${item.Id}`}
            className="flex items-center gap-2 rounded-full bg-white px-7 py-2.5 font-semibold text-black shadow-lg transition hover:scale-[1.03] hover:bg-white/90"
          >
            <Play className="h-5 w-5 fill-current" /> Play
          </Link>
          <Link
            to={`/title/${item.Id}`}
            className="flex items-center gap-2 rounded-full bg-white/10 px-7 py-2.5 font-semibold text-white ring-1 ring-line backdrop-blur-md transition hover:bg-white/20"
          >
            <Info className="h-5 w-5" /> More Info
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
