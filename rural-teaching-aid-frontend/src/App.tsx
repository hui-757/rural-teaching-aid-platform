import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { useAppStore } from './store/useAppStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import GradeSelectPage from './pages/GradeSelectPage'
import TeachHubPage from './pages/TeachHubPage'
import UnitSelectPage from './pages/UnitSelectPage'
import ContentTeachPage from './pages/ContentTeachPage'
import TestTeachPage from './pages/TestTeachPage'
import PracticePage from './pages/PracticePage'
import StudentAnalysisPage from './pages/StudentAnalysisPage'
import CompetitionPage from './pages/CompetitionPage'
import MaterialManagePage from './pages/MaterialManagePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  const loggedRef = useRef(false)

  useEffect(() => {
    if (!loggedRef.current) {
      loggedRef.current = true
      console.log('[ProtectedRoute] mounted, loading=', loading, 'user=', user?.nickname ?? null)
    }
  }, [loading, user])

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

  if (!user) {
    console.log('[ProtectedRoute] no user, redirect to /login')
    return <Navigate to="/login" replace />
  }
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
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/select-grade" element={<GradeSelectPage />} />

        {/* 授课中心 & 功能选择 */}
        <Route
          path="/teach"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <TeachHubPage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teach/test/:category?"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <TestTeachPage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teach/:mode"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <UnitSelectPage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teach/content/:unitId"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <ContentTeachPage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teach/practice/:unitId"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <PracticePage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teach/materials"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <MaterialManagePage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />

        {/* 学情分析 */}
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <GradeGuard>
                <StudentAnalysisPage />
              </GradeGuard>
            </ProtectedRoute>
          }
        />

        {/* 竞赛闯关 */}
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

        {/* 旧路由兼容跳转 */}
        <Route path="/units" element={<Navigate to="/teach" replace />} />
        <Route path="/teach/:unitId" element={<Navigate to="/teach" replace />} />

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
