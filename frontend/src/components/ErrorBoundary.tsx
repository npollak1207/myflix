import { Component, type ErrorInfo, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-4 text-center">
          <TriangleAlert className="h-12 w-12 text-accent" />
          <h1 className="text-xl font-semibold text-white">Something went wrong</h1>
          <p className="max-w-md text-sm text-neutral-400">{this.state.error.message}</p>
          <button
            onClick={() => {
              this.setState({ error: null })
              window.location.assign('/')
            }}
            className="rounded bg-neutral-800 px-4 py-2 text-sm text-white transition hover:bg-neutral-700"
          >
            Back to home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
