import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
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
  const { currentGrade } = useAppStore()
  const [questions, setQuestions] = useState<CalcQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null)

  useEffect(() => {
    if (selectedCategory && currentGrade) {
      loadQuestions(selectedCategory, currentGrade)
    }
  }, [selectedCategory, currentGrade])

  const loadQuestions = async (cat: string, grade: string) => {
    setLoading(true)
    const { data } = await supabase.from('calc_question').select('*').eq('category', cat).eq('grade', grade)
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
        @page { size: A4; margin: 18mm 12mm; }
        body{font-family:serif;max-width:800px;margin:0 auto;line-height:1.5}
        h1{text-align:center;margin-bottom:6px;font-size:20px}
        .subtitle{text-align:center;color:#666;margin-bottom:18px;font-size:12px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px 32px}
        .q-wrapper{page-break-inside:avoid;margin-bottom:4px}
        .q-text{font-size:14px;margin-bottom:6px}
        .q-num{display:inline-block;width:24px;font-weight:bold}
        .vertical-space{
          height:120px;
          border:1.5px dashed #ccc;
          border-radius:4px;
          background:repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 23px,
            #e5e5e5 23px,
            #e5e5e5 24px
          );
          padding:6px 10px;
          position:relative;
        }
        .vertical-space::before{
          content:"竖式计算区";
          position:absolute;
          top:3px;right:6px;
          font-size:10px;color:#bbb;
          font-family:sans-serif;
        }
        .page-break{page-break-after:always}
        .answer-sheet{margin-top:30px}
        .answer-row{display:flex;gap:40px;margin:5px 0;font-size:13px}
        @media print{
          body{margin:0}
          .grid{gap:16px 28px}
        }
      </style>
      </head><body>
      <h1>四年级上册 · ${selectedCategory} · 基础测试</h1>
      <p class="subtitle">共 ${questions.length} 题 · 生成时间：${new Date().toLocaleString()}</p>
      <div class="grid">
        ${questions.map((q, i) => `
          <div class="q-wrapper">
            <div class="q-text"><span class="q-num">${i + 1}.</span>${q.content}</div>
            <div class="vertical-space"></div>
          </div>
        `).join('')}
      </div>
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
