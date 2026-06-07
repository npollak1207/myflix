import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import App from '@/App'
import './index.css'

// Fade out the pre-mount splash screen once React has taken over.
function dismissSplash() {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.classList.add('hide')
  setTimeout(() => splash.remove(), 600)
}
setTimeout(dismissSplash, 300)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <MotionConfig reducedMotion="user">
              <App />
              <Toaster theme="dark" position="bottom-center" />
            </MotionConfig>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
