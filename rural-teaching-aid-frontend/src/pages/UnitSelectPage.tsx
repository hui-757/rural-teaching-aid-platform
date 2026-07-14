import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import type { Unit } from '../types'
import { BrickCard } from '../components/ui/BrickCard'
import { SealButton, SealBadge } from '../components/ui/SealButton'
import { BookOpen, Calculator, MessageCircle, Loader2, ArrowLeft } from 'lucide-react'

const MODE_CONFIG: Record<string, { title: string; desc: string; icon: React.ElementType; btnLabel: string; pathPrefix: string; accent: 'brick' | 'ink' | 'gold' }> = {
  content: { title: '内容讲述', desc: '选择单元，展示教材PDF', icon: BookOpen, btnLabel: '进入讲述', pathPrefix: '/teach/content', accent: 'brick' },
  test: { title: '基础测试', desc: '选择单元，生成打印试卷', icon: Calculator, btnLabel: '生成试卷', pathPrefix: '/teach/test', accent: 'ink' },
  practice: { title: '一起练', desc: '选择单元，开始课堂互动', icon: MessageCircle, btnLabel: '开始练习', pathPrefix: '/teach/practice', accent: 'gold' },
}

export default function UnitSelectPage() {
  const navigate = useNavigate()
  const { mode } = useParams<{ mode: string }>()
  const { currentGrade, setUnits, units } = useAppStore()
  const [loading, setLoading] = useState(true)

  const config = mode ? MODE_CONFIG[mode] : null

  useEffect(() => {
    fetchUnits()
  }, [currentGrade])

  const fetchUnits = async () => {
    setLoading(true)
    const grade = currentGrade || '四年级上'
    const { data, error } = await supabase
      .from('unit')
      .select('*')
      .eq('grade', grade)
      .order('unit_id')

    if (!error && data) {
      setUnits(data as Unit[])
    }
    setLoading(false)
  }

  if (!config) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-wall-text-muted font-serif">功能路径错误</p>
        <SealButton className="mt-4" onClick={() => navigate('/teach')}>
          返回授课中心
        </SealButton>
      </div>
    )
  }

  const Icon = config.icon

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px-88px)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-wall-text-muted">
          <Loader2 size={24} className="animate-spin" />
          <span className="font-serif">加载单元中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/teach')}
        className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> 返回授课中心
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Icon size={24} className="text-wall-brick" />
          <h1 className="text-2xl font-serif text-wall-text tracking-wider">{config.title}</h1>
        </div>
        <p className="text-wall-text-muted">{config.desc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <BrickCard
            key={unit.unit_id}
            title={unit.unit_name}
            subtitle={unit.unit_desc || ''}
            accent={config.accent}
            hover
          >
            <div className="flex items-center gap-2 mb-3">
              <SealBadge>第 {unit.unit_id} 单元</SealBadge>
            </div>
            <SealButton
              variant={config.accent === 'gold' ? 'gold' : 'solid'}
              size="sm"
              className="w-full"
              onClick={() => navigate(`${config.pathPrefix}/${unit.unit_id}`)}
            >
              <Icon size={14} className="mr-1" />
              {config.btnLabel}
            </SealButton>
          </BrickCard>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-20">
          <p className="text-wall-text-muted font-serif">暂无单元数据</p>
        </div>
      )}
    </div>
  )
}
