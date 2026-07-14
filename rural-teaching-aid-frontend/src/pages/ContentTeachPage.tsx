import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Unit } from '../types'
import { GreatWallDivider } from '../components/ui/BrickCard'
import { SealBadge } from '../components/ui/SealButton'
import { BookOpen, FileText, Download, ArrowLeft, Loader2 } from 'lucide-react'

const TEXTBOOK_MAP: Record<number, string> = {
  2: '/textbook/一_万以上数的认识.pdf',
  3: '/textbook/二_角的度量.pdf',
  4: '/textbook/三_多位数乘两位数.pdf',
  5: '/textbook/四_加法模型和乘法模型.pdf',
  6: '/textbook/五_平行四边形和梯形.pdf',
  7: '/textbook/六_条形统计图.pdf',
  8: '/textbook/七_复习与关联.pdf',
}

export default function ContentTeachPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (unitId) fetchUnit()
  }, [unitId])

  const fetchUnit = async () => {
    setLoading(true)
    const id = Number(unitId)
    const { data } = await supabase.from('unit').select('*').eq('unit_id', id).single()
    if (data) setUnit(data as Unit)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px-88px)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-wall-text-muted" />
      </div>
    )
  }

  if (!unit) return <div className="p-8 text-center text-wall-text-muted">单元不存在</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/teach/content')}
        className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> 返回单元选择
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={24} className="text-wall-brick" />
          <h1 className="text-2xl font-serif text-wall-text tracking-wider">{unit.unit_name}</h1>
        </div>
        <SealBadge>第 {unit.unit_id} 单元</SealBadge>
        <p className="text-wall-text-muted mt-2">{unit.unit_desc}</p>
      </div>

      <GreatWallDivider />

      <div className="bg-wall-paper border-2 border-wall-border rounded-lg overflow-hidden mt-6">
        <div className="flex items-center justify-between px-5 py-3 bg-wall-bg-deep border-b border-wall-border">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-wall-brick" />
            <span className="font-serif text-wall-text font-medium">教材 PDF</span>
          </div>
          <div className="flex gap-2">
            {TEXTBOOK_MAP[unit.unit_id] && (
              <a
                href={TEXTBOOK_MAP[unit.unit_id]}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wall-brick/10 text-wall-brick-dark font-serif text-sm rounded border border-wall-brick/30 hover:bg-wall-brick/20 transition-colors"
              >
                <Download size={14} />
                下载
              </a>
            )}
          </div>
        </div>
        {TEXTBOOK_MAP[unit.unit_id] ? (
          <div className="w-full" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
            <iframe
              src={TEXTBOOK_MAP[unit.unit_id]}
              className="w-full h-full border-0"
              title={`${unit.unit_name} 教材`}
            />
          </div>
        ) : (
          <div className="p-12 text-center text-wall-text-muted">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-serif">本单元暂无教材文件</p>
          </div>
        )}
      </div>
    </div>
  )
}
