import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import Library from '@/pages/Library'
import Detail from '@/pages/Detail'
import Series from '@/pages/Series'
import Search from '@/pages/Search'
import MyList from '@/pages/MyList'
import Person from '@/pages/Person'
import Collection from '@/pages/Collection'
import Settings from '@/pages/Settings'

// The player pulls in Vidstack (~70% of the bundle) — load it on demand.
const Player = lazy(() => import('@/pages/Player'))

function Shell() {
  const location = useLocation()
  return (
    <div className="relative min-h-screen bg-ink text-white">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/watch/:id"
          element={
            <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
              <Player />
            </Suspense>
          }
        />
        <Route element={<Shell />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/library/:id" element={<Library />} />
          <Route path="/title/:id" element={<Detail />} />
          <Route path="/series/:id" element={<Series />} />
          <Route path="/person/:id" element={<Person />} />
          <Route path="/collection/:id" element={<Collection />} />
        </Route>
      </Route>
    </Routes>
  )
}
