import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { useAppStore } from './store/useAppStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import GradeSelectPage from './pages/GradeSelectPage'
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

function GradeGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const { currentGrade } = useAppStore()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace />

  // 未选择年级且当前不在选择年级页面，则跳转
  if (currentGrade === null && location.pathname !== '/select-grade') {
    return <Navigate to="/select-grade" replace />
  }

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
        <Route path="/select-grade" element={<GradeSelectPage />} />
        <Route
          path="/units"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <UnitSelectPage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teach/:unitId"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <TeachPage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/competition"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <CompetitionPage />
              </GradeGuard>
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
