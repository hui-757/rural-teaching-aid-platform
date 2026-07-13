import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { BookOpen, Trophy, User, LogOut, ChevronDown, GraduationCap } from 'lucide-react'
import { useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthStore()
  const { currentGrade, setGrade } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await signOut()
    setGrade(0) // 清除年级选择（localStorage 会保留，但 store 重置为 null 需要特殊处理，这里用 navigate 后页面会重新加载）
    localStorage.removeItem('rta_selected_grade')
    navigate('/login')
    window.location.reload()
  }

  const isHome = location.pathname === '/'

  const gradeLabel = currentGrade ? `${['一','二','三','四','五','六'][currentGrade - 1]}年级` : '未选择年级'

  return (
    <div className="min-h-screen wall-texture flex flex-col">
      {/* Top Navigation - Great Wall style */}
      <header className="bg-wall-stone-dark border-b-4 border-wall-gold shadow-lg relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-wall-gold-light opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-wall-brick border-2 border-wall-gold rounded wall-texture flex items-center justify-center">
              <span className="text-wall-gold-light font-serif font-bold text-lg">教</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-wall-paper font-serif text-lg tracking-widest">乡村教学辅助平台</h1>
              <p className="text-wall-gold-light text-xs tracking-wider -mt-1">
                {currentGrade ? `${gradeLabel} · 数学` : '请选择年级'}
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          {user && !isHome && currentGrade && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-4 py-2 text-wall-paper/80 hover:text-wall-gold-light font-serif tracking-wider text-sm transition-colors rounded hover:bg-white/5"
              >
                首页
              </Link>
              <Link
                to="/units"
                className="px-4 py-2 text-wall-paper/80 hover:text-wall-gold-light font-serif tracking-wider text-sm transition-colors rounded hover:bg-white/5 flex items-center gap-1"
              >
                <BookOpen size={14} />
                授课
              </Link>
              <Link
                to="/competition"
                className="px-4 py-2 text-wall-paper/80 hover:text-wall-gold-light font-serif tracking-wider text-sm transition-colors rounded hover:bg-white/5 flex items-center gap-1"
              >
                <Trophy size={14} />
                竞赛
              </Link>
              <button
                onClick={() => navigate('/select-grade')}
                className="px-3 py-1.5 text-wall-gold-light/80 hover:text-wall-gold-light font-serif tracking-wider text-xs transition-colors rounded hover:bg-white/5 flex items-center gap-1 border border-wall-gold/20"
              >
                <GraduationCap size={12} />
                {gradeLabel}
              </button>
            </nav>
          )}

          {/* User Menu */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-wall-paper/90 hover:text-wall-gold-light transition-colors"
              >
                <div className="w-8 h-8 bg-wall-brick border border-wall-gold rounded-full flex items-center justify-center">
                  <User size={14} className="text-wall-gold-light" />
                </div>
                <span className="font-serif text-sm hidden sm:block">{user.nickname}</span>
                <ChevronDown size={14} />
              </button>
            ) : (
              <Link to="/login" className="seal-stamp text-sm">
                登录
              </Link>
            )}

            {showUserMenu && user && (
              <div className="absolute right-0 mt-2 w-48 bg-wall-paper border-2 border-wall-brick-dark rounded shadow-xl z-50 animate-fade-in-up">
                <div className="p-3 border-b border-wall-border">
                  <p className="font-serif text-wall-text font-medium">{user.nickname}</p>
                  <p className="text-xs text-wall-text-muted">教师账号</p>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/select-grade') }}
                  className="w-full px-4 py-2 text-left text-wall-brick-dark hover:bg-wall-bg-deep font-serif text-sm flex items-center gap-2 transition-colors"
                >
                  <GraduationCap size={14} />
                  切换年级
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-wall-brick-dark hover:bg-wall-bg-deep font-serif text-sm flex items-center gap-2 transition-colors"
                >
                  <LogOut size={14} />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-wall-stone-dark border-t-4 border-wall-gold py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-wall-gold-light/60 font-serif text-sm tracking-wider">
            乡村教学辅助平台 · 助力乡村教育
          </p>
        </div>
      </footer>
    </div>
  )
}
