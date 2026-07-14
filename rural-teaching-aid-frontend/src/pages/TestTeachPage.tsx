import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Unit, Question } from '../types'
import { ScrollPanel, GreatWallDivider } from '../components/ui/BrickCard'
import { SealButton, SealBadge } from '../components/ui/SealButton'
import { Calculator, Printer, ArrowLeft, Loader2 } from 'lucide-react'

export default function TestTeachPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (unitId) fetchData()
  }, [unitId])

  const fetchData = async () => {
    setLoading(true)
    const id = Number(unitId)
    const { data: unitData } = await supabase.from('unit').select('*').eq('unit_id', id).single()
    if (unitData) {
      setUnit(unitData as Unit)
      const { data: qData } = await supabase.from('question').select('*').eq('unit_id', id)
      if (qData) setQuestions(qData as Question[])
    }
    setLoading(false)
  }

  const handlePrintTest = () => {
    const calcQuestions = questions.filter((q) => q.type === 'calculation')
    const printWindow = window.open('', '_blank')
    if (printWindow && calcQuestions.length > 0) {
      const html = `
        <html><head><title>基础测试 - ${unit?.unit_name}</title>
        <style>body{font-family:serif;max-width:800px;margin:40px auto;line-height:2} h1{text-align:center} .q{margin:20px 0} .page-break{page-break-after:always}</style>
        </head><body>
        <h1>${unit?.unit_name} - 基础测试</h1>
        <p style="text-align:center;color:#666">生成时间：${new Date().toLocaleString()}</p>
        ${calcQuestions.map((q, i) => `<div class="q">${i + 1}. ${q.content}</div>`).join('')}
        <div class="page-break"></div>
        <h1>答案</h1>
        ${calcQuestions.map((q, i) => `<div class="q">${i + 1}. ${q.answer}</div>`).join('')}
        </body></html>
      `
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px-88px)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-wall-text-muted" />
      </div>
    )
  }

  if (!unit) return <div className="p-8 text-center text-wall-text-muted">单元不存在</div>

  const calcQuestions = questions.filter((q) => q.type === 'calculation')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/teach/test')}
        className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> 返回单元选择
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator size={24} className="text-wall-ink" />
          <h1 className="text-2xl font-serif text-wall-text tracking-wider">{unit.unit_name} - 基础测试</h1>
        </div>
        <SealBadge>第 {unit.unit_id} 单元</SealBadge>
      </div>

      <GreatWallDivider />

      <ScrollPanel title="试卷内容">
        {calcQuestions.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-wall-text-muted text-sm">共 {calcQuestions.length} 道计算题</p>
              <SealButton variant="gold" size="sm" onClick={handlePrintTest}>
                <Printer size={14} className="mr-1" />
                打印试卷
              </SealButton>
            </div>
            <div className="space-y-3">
              {calcQuestions.map((q, i) => (
                <div key={q.question_id} className="bg-wall-bg-deep p-4 rounded border border-wall-border flex justify-between items-start">
                  <span className="text-wall-text font-medium">{i + 1}. {q.content}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-wall-text-muted">
            <Calculator size={32} className="mx-auto mb-2 opacity-50" />
            <p>本单元暂无计算题</p>
          </div>
        )}
      </ScrollPanel>
    </div>
  )
}
