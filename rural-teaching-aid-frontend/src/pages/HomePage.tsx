import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { BookOpen, Trophy, Shield, Scroll, GraduationCap } from 'lucide-react'
import { SealButton, GoldBadge } from '../components/ui/SealButton'
import { GreatWallDivider } from '../components/ui/BrickCard'

export default function HomePage() {
  const { user } = useAuthStore()
  const { currentGrade } = useAppStore()
  const navigate = useNavigate()

  const gradeLabel = currentGrade
    ? currentGrade.replace('上', '上册').replace('下', '下册')
    : '未选择年级'

  return (
    <div className="min-h-[calc(100vh-64px-88px)] flex flex-col items-center justify-center px-4 py-12">

      {/* Hero Section */}
      <div className="text-center mb-10 relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 mb-3">
          {currentGrade ? (
            <GoldBadge>{gradeLabel} · 数学</GoldBadge>
          ) : (
            <button
              onClick={() => navigate('/select-grade')}
              className="inline-flex items-center gap-1 px-3 py-1 bg-wall-brick/10 text-wall-brick-dark font-serif text-sm border border-wall-brick/30 rounded hover:bg-wall-brick/20 transition-colors"
            >
              <GraduationCap size={14} />
              选择年级
            </button>
          )}
          <span className="text-wall-text-muted text-sm">|</span>
          <GoldBadge>人教版</GoldBadge>
        </div>

        <div className="text-center mb-2">
          <h1 className="text-lg md:text-xl font-serif text-wall-text tracking-widest">🏫 乡村教学辅助平台</h1>
          <p className="text-wall-text-muted text-[10px] font-serif mt-0.5">教材辅助 · 基础练习 · 课堂互动 · 闯关游戏</p>
        </div>
      </div>

      {/* Main Entry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10">
        {/* Teach Entry */}
        <div
          onClick={() => currentGrade ? navigate('/teach') : navigate('/select-grade')}
          className="group cursor-pointer bg-wall-paper border-2 border-wall-border rounded-lg p-8 brick-pattern hover:border-wall-brick transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-wall-brick" />
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-wall-brick/10 border-2 border-wall-brick rounded-lg flex items-center justify-center mb-4 group-hover:bg-wall-brick group-hover:scale-110 transition-all duration-300">
              <BookOpen size={36} className="text-wall-brick group-hover:text-wall-paper transition-colors" />
            </div>
            <h2 className="text-2xl font-serif text-wall-text mb-2 tracking-wider">授课</h2>
            <p className="text-wall-text-soft text-sm mb-4">
              教材内容讲述 · 基础测试生成 · 课堂互动练习
            </p>
            <SealButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); currentGrade ? navigate('/teach') : navigate('/select-grade') }}>
              {currentGrade ? '进入授课' : '先选择年级'}
            </SealButton>
          </div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-t-2 border-l-2 border-wall-border/40 rounded-tl-xl" />
        </div>

        {/* Competition Entry */}
        <div
          onClick={() => currentGrade ? navigate('/competition') : navigate('/select-grade')}
          className="group cursor-pointer bg-wall-paper border-2 border-wall-border rounded-lg p-8 brick-pattern hover:border-wall-gold transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-wall-gold" />
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-wall-gold/10 border-2 border-wall-gold rounded-lg flex items-center justify-center mb-4 group-hover:bg-wall-gold group-hover:scale-110 transition-all duration-300">
              <Trophy size={36} className="text-wall-gold group-hover:text-wall-paper transition-colors" />
            </div>
            <h2 className="text-2xl font-serif text-wall-text mb-2 tracking-wider">竞赛</h2>
            <p className="text-wall-text-soft text-sm mb-4">
              闯关挑战 · 难度定级 · 排行展示 · 错题记录
            </p>
            <SealButton variant="gold" size="sm" onClick={(e) => { e.stopPropagation(); currentGrade ? navigate('/competition') : navigate('/select-grade') }}>
              {currentGrade ? '开始闯关' : '先选择年级'}
            </SealButton>
          </div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-t-2 border-l-2 border-wall-border/40 rounded-tl-xl" />
        </div>
      </div>

      {/* Quick Stats / Info */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-wall-text-muted text-sm relative z-10">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-wall-ink" />
          <span>已登录：{user ? user.nickname : '未登录'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Scroll size={16} className="text-wall-brick" />
          <span>当前年级：{gradeLabel}</span>
        </div>
      </div>
    </div>
  )
}
