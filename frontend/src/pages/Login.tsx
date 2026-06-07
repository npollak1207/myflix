import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(username, password)
      navigate(location.state?.from ?? '/', { replace: true })
    } catch {
      setError('Login failed. Check your username and password.')
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full rounded-xl bg-white/5 px-4 py-2.5 text-white ring-1 ring-line outline-none transition placeholder:text-neutral-500 focus:bg-white/10 focus:ring-2 focus:ring-accent/70'

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm animate-fade-up rounded-2xl bg-surface/70 p-8 shadow-card ring-1 ring-line backdrop-blur-xl"
      >
        <h1 className="mb-1 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-center font-display text-3xl font-bold tracking-tight text-transparent">
          MYFLIX
        </h1>
        <p className="mb-7 text-center text-sm text-neutral-500">Sign in to continue</p>

        <label className="mb-1.5 block text-sm text-neutral-400">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
          className={`mb-4 ${field}`}
        />
        <label className="mb-1.5 block text-sm text-neutral-400">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className={`mb-5 ${field}`}
        />
        {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
