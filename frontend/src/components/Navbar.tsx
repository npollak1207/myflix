import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Search, Settings, Shuffle } from 'lucide-react'
import { toast } from 'sonner'
import { getRandomMovie } from '@/api/jellyfin'
import { useAuth } from '@/context/AuthContext'
import { useLibraries } from '@/hooks/useLibraries'
import { SearchBox } from './SearchBox'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap text-sm font-medium transition-colors ${
    isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
  }`

const iconBtn =
  'flex items-center gap-1.5 rounded-full bg-white/5 p-2 text-neutral-200 ring-1 ring-line transition hover:bg-white/10 hover:text-white sm:px-3'

export function Navbar() {
  const { logout, session } = useAuth()
  const { data: libraries } = useLibraries()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function shuffle() {
    const movie = await getRandomMovie()
    if (movie) navigate(`/watch/${movie.Id}`)
    else toast.error('No movies to shuffle')
  }

  const navLinks = (
    <>
      <NavLink to="/" end className={linkClass}>
        Home
      </NavLink>
      {libraries?.map((lib) => (
        <NavLink key={lib.Id} to={`/library/${lib.Id}`} className={linkClass}>
          {lib.Name}
        </NavLink>
      ))}
      <NavLink to="/my-list" className={linkClass}>
        My List
      </NavLink>
    </>
  )

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? 'border-b border-line bg-ink/70 backdrop-blur-xl'
          : 'border-b border-transparent bg-gradient-to-b from-black/70 to-transparent'
      }`}
    >
      <div className="flex items-center gap-5 px-4 py-3 md:gap-7 md:px-8">
        <Link
          to="/"
          className="shrink-0 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text font-display text-lg font-bold tracking-tight text-transparent md:text-xl"
        >
          MYFLIX
        </Link>

        {/* Inline nav — desktop only */}
        <nav className="hidden items-center gap-5 md:flex">{navLinks}</nav>

        <div className="ml-auto flex items-center gap-2 text-neutral-400 md:gap-2.5">
          <button onClick={() => void shuffle()} title="Play something random" className={iconBtn}>
            <Shuffle className="h-4 w-4" />
            <span className="hidden md:inline">Shuffle</span>
          </button>

          {/* Full search on desktop, icon → /search on mobile */}
          <div className="hidden md:block">
            <SearchBox />
          </div>
          <NavLink
            to="/search"
            aria-label="Search"
            className="rounded-full bg-white/5 p-2 text-neutral-300 ring-1 ring-line transition hover:bg-white/10 hover:text-white md:hidden"
          >
            <Search className="h-4 w-4" />
          </NavLink>

          <NavLink
            to="/settings"
            title="Settings"
            aria-label="Settings"
            className="rounded-full bg-white/5 p-2 text-neutral-300 ring-1 ring-line transition hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </NavLink>
          <button onClick={() => void logout()} className={iconBtn} title="Sign out">
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">{session?.username ?? 'Sign out'}</span>
          </button>
        </div>
      </div>

      {/* Scrollable nav row — mobile only */}
      <nav className="no-scrollbar flex items-center gap-5 overflow-x-auto px-4 pb-2.5 md:hidden">
        {navLinks}
      </nav>
    </header>
  )
}
