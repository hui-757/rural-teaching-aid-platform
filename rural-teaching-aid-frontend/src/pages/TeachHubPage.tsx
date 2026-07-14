import { useNavigate } from 'react-router-dom'
import { BookOpen, Calculator, MessageCircle, Users } from 'lucide-react'
import { GreatWallDivider } from '../components/ui/BrickCard'
import { SealButton } from '../components/ui/SealButton'
import { useAuthStore } from '../store/useAuthStore'

export default function TeachHubPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const features = [
    {
      key: 'content',
      title: '内容讲述',
      desc: '教材PDF展示、资料管理',
      icon: BookOpen,
      color: 'brick',
      path: '/teach/content',
    },
    {
      key: 'test',
      title: '基础测试',
      desc: '生成打印试卷、查看答案',
      icon: Calculator,
      color: 'ink',
      path: '/teach/test',
    },
    {
      key: 'practice',
      title: '一起练',
      desc: '课堂互动、实时标记学号答题',
      icon: MessageCircle,
      color: 'gold',
      path: '/teach/practice',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-64px-88px)] flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl md:text-4xl font-serif text-wall-text mb-3 tracking-widest">
          授课中心
        </h1>
        <GreatWallDivider className="max-w-sm mx-auto" />
        <p className="text-wall-text-soft mt-3 font-serif">选择功能后进入单元</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
        {features.map((f) => {
          const Icon = f.icon
          const colorMap: Record<string, { border: string; bg: string; text: string; hover: string }> = {
            brick: { border: 'border-wall-brick', bg: 'bg-wall-brick/10', text: 'text-wall-brick', hover: 'hover:bg-wall-brick hover:text-wall-paper' },
            ink: { border: 'border-wall-ink', bg: 'bg-wall-ink/10', text: 'text-wall-ink', hover: 'hover:bg-wall-ink hover:text-wall-paper' },
            gold: { border: 'border-wall-gold', bg: 'bg-wall-gold/10', text: 'text-wall-gold', hover: 'hover:bg-wall-gold hover:text-wall-paper' },
          }
          const c = colorMap[f.color]

          return (
            <div
              key={f.key}
              onClick={() => navigate(f.path)}
              className={`group cursor-pointer bg-wall-paper border-2 ${c.border} rounded-lg p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${c.bg.replace('/10', '')}`} />
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${c.bg} border-2 ${c.border} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 ${c.hover}`}>
                  <Icon size={32} className={`${c.text} group-hover:text-wall-paper transition-colors`} />
                </div>
                <h2 className="text-xl font-serif text-wall-text mb-2 tracking-wider">{f.title}</h2>
                <p className="text-wall-text-soft text-sm mb-4">{f.desc}</p>
                <SealButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(f.path) }}>
                  进入选择单元
                </SealButton>
              </div>
            </div>
          )
        })}
      </div>

      {user && (
        <div className="mt-10 relative z-10">
          <button
            onClick={() => navigate('/students')}
            className="flex items-center gap-2 px-5 py-2.5 bg-wall-paper border-2 border-wall-brick rounded-lg text-wall-brick-dark font-serif hover:bg-wall-brick hover:text-wall-paper transition-colors"
          >
            <Users size={18} />
            学情分析 — 查看学生综合数据
          </button>
        </div>
      )}
    </div>
  )
}
