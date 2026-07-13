import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import type { Unit } from '../types'
import { BrickCard } from '../components/ui/BrickCard'
import { SealButton, SealBadge } from '../components/ui/SealButton'
import { BookOpen, Calculator, Users, Loader2 } from 'lucide-react'

export default function UnitSelectPage() {
  const navigate = useNavigate()
  const { currentGrade, setUnits, units } = useAppStore()
  const [loading, setLoading] = useState(true)

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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={24} className="text-wall-brick" />
          <h1 className="text-2xl font-serif text-wall-text tracking-wider">选择单元</h1>
        </div>
        <p className="text-wall-text-muted">请选择要授课或闯关的单元</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <BrickCard
            key={unit.unit_id}
            title={unit.unit_name}
            subtitle={unit.unit_desc || ''}
            accent={unit.has_test ? 'brick' : 'stone'}
            hover
          >
            <div className="flex items-center gap-2 mb-3">
              <SealBadge>第 {unit.unit_id} 单元</SealBadge>
              {unit.has_test && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-wall-ink/10 text-wall-ink text-xs rounded border border-wall-ink/20">
                  <Calculator size={10} />
                  含计算题
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <SealButton
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/teach/${unit.unit_id}`)}
              >
                <BookOpen size={14} className="mr-1" />
                授课
              </SealButton>
              <SealButton
                variant="solid"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/competition?unit=${unit.unit_id}`)}
              >
                <Users size={14} className="mr-1" />
                闯关
              </SealButton>
            </div>
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
