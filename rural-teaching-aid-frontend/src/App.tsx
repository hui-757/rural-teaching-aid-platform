import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import UnitSelectPage from './pages/UnitSelectPage'
import TeachPage from './pages/TeachPage'
import CompetitionPage from './pages/CompetitionPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center wall-texture">
        <div className="flex items-center gap-3 text-wall-text-muted">
          <div className="w-6 h-6 border-2 border-wall-brick border-t-transparent rounded-full animate-spin" />
          <span className="font-serif">加载中...</span>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppContent() {
  const { fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/units"
          element={
            <ProtectedRoute>
              <UnitSelectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teach/:unitId"
          element={
            <ProtectedRoute>
              <TeachPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/competition"
          element={
            <ProtectedRoute>
              <CompetitionPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
