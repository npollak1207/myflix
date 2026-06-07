export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-neutral-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-white" />
      {label && <span className="ml-3">{label}</span>}
    </div>
  )
}
