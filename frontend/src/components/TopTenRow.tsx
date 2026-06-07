import { motion } from 'framer-motion'
import type { BaseItemDto } from '@/api/types'
import { PosterCard } from './PosterCard'

// Ranked row with oversized outlined numerals behind each poster.
export function TopTenRow({ title, items }: { title: string; items: BaseItemDto[] }) {
  if (!items.length) return null
  return (
    <motion.section
      className="mb-10"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="mb-3 px-4 text-base font-semibold tracking-tight text-white/90 md:px-12">
        {title}
      </h2>
      <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-3 pt-1 md:px-12">
        {items.slice(0, 10).map((item, i) => (
          <div key={item.Id} className="flex shrink-0 items-end">
            <span
              className="select-none font-display text-[5.5rem] font-extrabold leading-[0.8] text-ink md:text-[8rem]"
              style={{ WebkitTextStroke: '2px rgba(255,255,255,0.28)' }}
            >
              {i + 1}
            </span>
            <div className="-ml-5 w-24 md:-ml-7 md:w-32">
              <PosterCard item={item} />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
