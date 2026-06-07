import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface ring-1 ring-line">
        <Icon className="h-9 w-9 text-neutral-500" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 max-w-sm text-sm text-neutral-500">{subtitle}</p>}
      </div>
    </div>
  )
}
