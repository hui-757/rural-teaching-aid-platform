import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { BookOpen, Trophy, User, LogOut, ChevronDown, GraduationCap, Users } from 'lucide-react'
import { useState } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthStore()
  const { currentGrade, setGrade } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await signOut()
    setGrade('')
    localStorage.removeItem('rta_selected_grade')
    navigate('/login')
    window.location.reload()
  }

  const isHome = location.pathname === '/'

  const gradeLabel = currentGrade ? currentGrade.replace('上', '·上册').replace('下', '·下册') : '未选择年级'

  return (
    <div className="min-h-screen wall-texture flex flex-col">
      {/* Top Navigation - Great Wall style */}
      <header className="bg-wall-stone-dark border-b-4 border-wall-gold shadow-lg relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-wall-gold-light opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          {/* Logo — 固定左侧 */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0 w-[200px]">
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

          {/* Nav Links — 真正居中 */}
          {user && !isHome && currentGrade && (
            <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
              <Link
                to="/"
                className="px-4 py-2 text-wall-paper/80 hover:text-wall-gold-light font-serif tracking-wider text-sm transition-colors rounded hover:bg-white/5"
              >
                首页
              </Link>
              <Link
                to="/teach"
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
              <Link
                to="/students"
                className="px-4 py-2 text-wall-paper/80 hover:text-wall-gold-light font-serif tracking-wider text-sm transition-colors rounded hover:bg-white/5 flex items-center gap-1"
              >
                <Users size={14} />
                学情分析
              </Link>
            </nav>
          )}

          {/* Right side — 固定右侧 */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0 w-[200px]">
            {/* Grade Switch — always visible when user logged in */}
            {user && (
              <button
                onClick={() => navigate('/select-grade')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-wall-gold-light/90 hover:text-wall-gold-light font-serif text-sm transition-colors rounded hover:bg-white/10 border border-wall-gold/30"
                title="切换年级"
              >
                <GraduationCap size={14} />
                <span className="hidden sm:inline">{gradeLabel}</span>
                <span className="sm:hidden">{currentGrade ? `${currentGrade}年级` : '年级'}</span>
              </button>
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
