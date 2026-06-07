import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { BaseItemDto } from '@/api/types'
import { LandscapeCard } from './LandscapeCard'

export function LandscapeRow({
  title,
  items,
  onDismiss,
}: {
  title: string
  items: BaseItemDto[]
  onDismiss?: (item: BaseItemDto) => void
}) {
  const scroller = useRef<HTMLDivElement>(null)
  if (!items.length) return null
  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <motion.section
      className="group/row relative mb-10"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="mb-3 px-4 text-base font-semibold tracking-tight text-white/90 md:px-12">
        {title}
      </h2>
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="absolute left-1 top-[55%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 ring-1 ring-white/10 backdrop-blur-md transition group-hover/row:opacity-100 hover:bg-black/80 md:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="absolute right-1 top-[55%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 ring-1 ring-white/10 backdrop-blur-md transition group-hover/row:opacity-100 hover:bg-black/80 md:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div
        ref={scroller}
        className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-3 pt-1 md:gap-4 md:px-12"
      >
        {items.map((item) => (
          <div key={item.Id} className="w-56 shrink-0 md:w-72">
            <LandscapeCard item={item} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </motion.section>
  )
}
