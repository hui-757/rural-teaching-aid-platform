import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Unit, Question } from '../types'
import { ScrollPanel, GreatWallDivider } from '../components/ui/BrickCard'
import { SealButton, SealBadge } from '../components/ui/SealButton'
import { BookOpen, Calculator, Loader2, Printer, MessageCircle } from 'lucide-react'

export default function TeachPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'content' | 'test' | 'practice'>('content')
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (unitId) fetchUnitData()
  }, [unitId])

  const fetchUnitData = async () => {
    setLoading(true)
    const { data: unitData } = await supabase
      .from('unit')
      .select('*')
      .eq('unit_id', unitId)
      .single()

    if (unitData) {
      setUnit(unitData as Unit)
      const { data: qData } = await supabase
        .from('question')
        .select('*')
        .eq('unit_id', unitId)

      if (qData) {
        setQuestions(qData as Question[])
        // Random 5 questions for practice
        const shuffled = [...qData].sort(() => Math.random() - 0.5)
        setPracticeQuestions(shuffled.slice(0, 5) as Question[])
      }
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
        <div className="flex items-center gap-3 text-wall-text-muted">
          <Loader2 size={24} className="animate-spin" />
          <span className="font-serif">加载中...</span>
        </div>
      </div>
    )
  }

  if (!unit) return <div className="p-8 text-center text-wall-text-muted">单元不存在</div>

  const calcQuestions = questions.filter((q) => q.type === 'calculation')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={24} className="text-wall-brick" />
          <h1 className="text-2xl font-serif text-wall-text tracking-wider">{unit.unit_name}</h1>
        </div>
        <SealBadge>第 {unit.unit_id} 单元</SealBadge>
        <p className="text-wall-text-muted mt-2">{unit.unit_desc}</p>
      </div>

      <GreatWallDivider />

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-wall-bg-deep p-1 rounded-lg border border-wall-border">
        {[
          { key: 'content' as const, label: '内容讲述', icon: BookOpen },
          { key: 'test' as const, label: '基础测试', icon: Calculator },
          { key: 'practice' as const, label: '一起练', icon: MessageCircle },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-serif text-sm tracking-wider transition-all ${
              activeTab === tab.key
                ? 'bg-wall-paper text-wall-brick-dark border border-wall-border-dark shadow-sm'
                : 'text-wall-text-soft hover:text-wall-text'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'content' && (
          <ScrollPanel title="教材内容">
            <div className="space-y-4 text-wall-text leading-relaxed">
              <p className="font-serif text-lg">本单元主要内容包括：</p>
              <div className="bg-wall-bg-deep p-4 rounded border border-wall-border">
                <p>{unit.unit_desc}</p>
              </div>
              <p className="text-wall-text-muted text-sm">
                请教师根据教材内容为学生进行讲解，可使用本页面辅助教学。
              </p>
            </div>
          </ScrollPanel>
        )}

        {activeTab === 'test' && (
          <ScrollPanel title="基础测试">
            {calcQuestions.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-wall-text-muted text-sm">
                    共 {calcQuestions.length} 道计算题
                  </p>
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
                <div className="mt-4 p-3 bg-wall-gold/10 border border-wall-gold/20 rounded text-sm text-wall-gold font-serif">
                  答案已保存至教师用户中心，打印时答案页单独生成。
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-wall-text-muted">
                <Calculator size={32} className="mx-auto mb-2 opacity-50" />
                <p>本单元暂无计算题</p>
              </div>
            )}
          </ScrollPanel>
        )}

        {activeTab === 'practice' && (
          <ScrollPanel title="一起练">
            {practiceQuestions.length > 0 ? (
              <div className="space-y-4">
                <p className="text-wall-text-muted text-sm">课堂互动环节，学生举手回答以下问题：</p>
                {practiceQuestions.map((q, i) => (
                  <div key={q.question_id} className="bg-wall-bg-deep p-4 rounded border border-wall-border">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-wall-brick text-wall-paper rounded flex items-center justify-center font-serif text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-wall-text font-medium">{q.content}</p>
                        <p className="text-wall-ink text-sm mt-1">答案：{q.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-wall-text-muted">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>暂无互动题目</p>
              </div>
            )}
          </ScrollPanel>
        )}
      </div>
    </div>
  )
}
