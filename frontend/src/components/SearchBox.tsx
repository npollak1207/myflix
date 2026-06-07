import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, Search, X } from 'lucide-react'
import { getSearchHints, hintId, imageUrl, type SearchHint } from '@/api/jellyfin'
import { useDebounce } from '@/hooks/useDebounce'

const RECENTS_KEY = 'myflix.recentSearches'

function getRecents(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]')
  } catch {
    return []
  }
}
function addRecent(term: string) {
  const t = term.trim()
  if (!t) return
  const next = [t, ...getRecents().filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 6)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
}

export function SearchBox() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [recents, setRecents] = useState<string[]>(getRecents())
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounced = useDebounce(value, 250)

  // Press "/" anywhere to focus search (unless already typing in a field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/') return
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      if (typing) return
      e.preventDefault()
      inputRef.current?.focus()
      setOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { data: hints } = useQuery({
    queryKey: ['hints', debounced],
    queryFn: () => getSearchHints(debounced),
    enabled: debounced.trim().length >= 2,
  })

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function go(term: string) {
    addRecent(term)
    setRecents(getRecents())
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(term)}`)
  }
  function openHint(h: SearchHint) {
    setOpen(false)
    setValue('')
    const id = hintId(h)
    if (h.Type === 'Person') navigate(`/person/${id}`)
    else if (h.Type === 'BoxSet') navigate(`/collection/${id}`)
    else if (h.Type === 'Series') navigate(`/series/${id}`)
    else navigate(`/title/${id}`)
  }

  const showRecents = open && value.trim().length < 2 && recents.length > 0
  const showHints = open && (hints?.length ?? 0) > 0

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-line transition focus-within:bg-white/10 focus-within:ring-accent/60">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) go(value.trim())
          }}
          placeholder="Search…"
          className="w-28 bg-transparent text-sm text-white outline-none transition-all focus:w-44"
        />
        {value && (
          <button onClick={() => setValue('')} aria-label="Clear search">
            <X className="h-4 w-4 text-neutral-500 hover:text-white" />
          </button>
        )}
      </div>

      {(showRecents || showHints) && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl bg-surface/95 py-2 shadow-card ring-1 ring-line backdrop-blur-xl">
          {showRecents &&
            recents.map((r) => (
              <button
                key={r}
                onClick={() => go(r)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-300 hover:bg-white/5"
              >
                <Clock className="h-3.5 w-3.5 text-neutral-500" /> {r}
              </button>
            ))}
          {showHints &&
            hints!.map((h) => (
              <button
                key={hintId(h)}
                onClick={() => openHint(h)}
                className="flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-white/5"
              >
                <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-neutral-800">
                  {h.PrimaryImageTag && (
                    <img
                      src={imageUrl(hintId(h), 'Primary', { maxWidth: 80, tag: h.PrimaryImageTag })}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">{h.Name}</div>
                  <div className="text-xs text-neutral-500">
                    {h.Type === 'Person' ? 'Cast' : (h.ProductionYear ?? h.Type)}
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
