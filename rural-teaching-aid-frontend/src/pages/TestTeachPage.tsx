import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { CalcQuestion } from '../types'
import { ScrollPanel, GreatWallDivider } from '../components/ui/BrickCard'
import { SealButton, SealBadge } from '../components/ui/SealButton'
import { Calculator, Printer, ArrowLeft, Loader2, ChevronLeft } from 'lucide-react'

const CALC_CATEGORIES = [
  '口算乘法',
  '不进位笔算乘法',
  '连续进位笔算乘法',
  '中间有0的乘法',
  '末尾有0的乘法',
  '积的变化规律',
  '乘法估算与数学文化',
  '口算除法',
  '笔算除法竖式',
]

const TEST_QUESTION_COUNT = 20

export default function TestTeachPage() {
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<CalcQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null)

  useEffect(() => {
    if (selectedCategory) {
      loadQuestions(selectedCategory)
    }
  }, [selectedCategory])

  const loadQuestions = async (cat: string) => {
    setLoading(true)
    const { data } = await supabase.from('calc_question').select('*').eq('category', cat)
    if (data) {
      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setQuestions(shuffled.slice(0, TEST_QUESTION_COUNT) as CalcQuestion[])
    }
    setLoading(false)
  }

  const handlePrintTest = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <html><head><title>基础测试 - ${selectedCategory}</title>
      <style>
        body{font-family:serif;max-width:800px;margin:40px auto;line-height:2}
        h1{text-align:center;margin-bottom:8px}
        .subtitle{text-align:center;color:#666;margin-bottom:24px}
        .q{margin:16px 0;font-size:16px}
        .q-num{display:inline-block;width:32px;font-weight:bold}
        .page-break{page-break-after:always}
        .answer-sheet{margin-top:40px}
        .answer-row{display:flex;gap:40px;margin:8px 0}
        @media print{body{margin:20px}}
      </style>
      </head><body>
      <h1>四年级上册 · ${selectedCategory} · 基础测试</h1>
      <p class="subtitle">共 ${questions.length} 题 · 生成时间：${new Date().toLocaleString()}</p>
      ${questions.map((q, i) => `<div class="q"><span class="q-num">${i + 1}.</span>${q.content}</div>`).join('')}
      <div class="page-break"></div>
      <h1>参考答案</h1>
      <div class="answer-sheet">
        ${questions.map((q, i) => `
          <div class="answer-row">
            <span><strong>${i + 1}.</strong> ${q.answer}${q.answer_remainder ? ' ... 余 ' + q.answer_remainder : ''}</span>
          </div>
        `).join('')}
      </div>
      </body></html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  // Category selection
  if (!selectedCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/teach')}
          className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
        >
          <ChevronLeft size={14} /> 返回授课主页
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calculator size={24} className="text-wall-ink" />
            <h1 className="text-2xl font-serif text-wall-text tracking-wider">基础测试</h1>
          </div>
          <p className="text-wall-text-muted">请选择计算题类型生成测试</p>
        </div>

        <GreatWallDivider />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {CALC_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="group bg-wall-paper border-2 border-wall-border rounded-lg p-6 hover:border-wall-ink transition-all duration-300 text-left"
            >
              <h3 className="font-serif text-lg text-wall-text mb-1">{cat}</h3>
              <p className="text-wall-text-muted text-sm">点击生成测试</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Test view
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px-88px)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-wall-text-muted" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => {
          setSelectedCategory(null)
          setQuestions([])
        }}
        className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> 返回类型选择
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator size={24} className="text-wall-ink" />
          <h1 className="text-2xl font-serif text-wall-text tracking-wider">{selectedCategory} - 基础测试</h1>
        </div>
        <SealBadge>四年级上册 · 共 {questions.length} 题</SealBadge>
      </div>

      <GreatWallDivider />

      <ScrollPanel title="试卷内容">
        {questions.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-wall-text-muted text-sm">共 {questions.length} 道计算题 · 适合打印</p>
              <SealButton variant="gold" size="sm" onClick={handlePrintTest}>
                <Printer size={14} className="mr-1" />
                打印试卷
              </SealButton>
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-wall-bg-deep p-4 rounded border border-wall-border flex justify-between items-start">
                  <span className="text-wall-text font-medium">{i + 1}. {q.content}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-wall-text-muted">
            <Calculator size={32} className="mx-auto mb-2 opacity-50" />
            <p>该类型暂无题目</p>
          </div>
        )}
      </ScrollPanel>
    </div>
  )
}
