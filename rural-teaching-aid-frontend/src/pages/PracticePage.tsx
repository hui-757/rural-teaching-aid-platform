import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import type { Unit, CalcQuestion } from '../types'
import { ScrollPanel, GreatWallDivider } from '../components/ui/BrickCard'
import { SealButton, SealBadge } from '../components/ui/SealButton'
import {
  MessageCircle, Check, X, SkipForward, ArrowLeft, ArrowRight,
  Loader2, Calculator, ChevronLeft
} from 'lucide-react'

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

const PRACTICE_QUESTION_COUNT = 10

export default function PracticePage() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [unit, setUnit] = useState<Unit | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [questions, setQuestions] = useState<CalcQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [studentNumber, setStudentNumber] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, { student_number: string; is_correct: boolean; question_id: number }[]>>({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

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

  const loadQuestions = async (category: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('calc_question')
      .select('*')
      .eq('category', category)
      .eq('grade', '四年级上')

    if (data) {
      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setQuestions(shuffled.slice(0, PRACTICE_QUESTION_COUNT) as CalcQuestion[])
    }
    setLoading(false)
  }

  const selectCategory = async (category: string) => {
    setSelectedCategory(category)
    await loadQuestions(category)
  }

  const ensureSession = async (): Promise<string | null> => {
    if (sessionId) return sessionId
    if (!user || !unit) return null
    setCreating(true)
    const now = new Date()
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const label = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${weekdays[now.getDay()]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${unit.unit_name} · ${selectedCategory}`

    const { data, error } = await supabase
      .from('practice_session')
      .insert({ teacher_id: user.id, unit_id: unit.unit_id, session_label: label })
      .select('id')
      .single()

    setCreating(false)
    if (!error && data) {
      setSessionId(data.id)
      return data.id
    }
    return null
  }

  const markAnswer = async (isCorrect: boolean) => {
    if (!sessionId) await ensureSession()
    if (!studentNumber || !questions[currentIdx]) return

    const q = questions[currentIdx]
    const sid = sessionId || (await ensureSession() && sessionId)
    if (!sid) return

    await supabase.from('practice_answer').insert({
      session_id: sid,
      student_number: studentNumber.trim(),
      question_id: q.id,
      is_correct: isCorrect,
    })

    setAnswers((prev) => {
      const key = studentNumber.trim()
      const existing = prev[key] || []
      return { ...prev, [key]: [...existing, { student_number: key, is_correct: isCorrect, question_id: q.id }] }
    })

    setStudentNumber('')
  }

  const skipQuestion = () => {
    setStudentNumber('')
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1)
  }

  const stats = Object.entries(answers).map(([num, list]) => ({
    number: num,
    total: list.length,
    correct: list.filter((a) => a.is_correct).length,
  }))

  // Loading state
  if (loading && !selectedCategory) {
    return (
      <div className="min-h-[calc(100vh-64px-88px)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-wall-text-muted" />
      </div>
    )
  }

  if (!unit) return <div className="p-8 text-center text-wall-text-muted">单元不存在</div>

  // Category selection
  if (!selectedCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/teach/practice')}
          className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
        >
          <ChevronLeft size={14} /> 返回单元选择
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={24} className="text-wall-gold" />
            <h1 className="text-2xl font-serif text-wall-text tracking-wider">
              {unit.unit_name} - 一起练
            </h1>
          </div>
          <SealBadge>第 {unit.unit_id} 单元</SealBadge>
          <p className="text-wall-text-muted mt-2">请选择计算题类型开始课堂互动</p>
        </div>

        <GreatWallDivider />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {CALC_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className="group bg-wall-paper border-2 border-wall-border rounded-lg p-6 hover:border-wall-gold transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-wall-gold/10 border border-wall-gold rounded flex items-center justify-center">
                  <Calculator size={20} className="text-wall-gold" />
                </div>
                <h3 className="font-serif text-lg text-wall-text">{cat}</h3>
              </div>
              <p className="text-wall-text-muted text-sm">点击开始练习</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Questions loading
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px-88px)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-wall-text-muted" />
      </div>
    )
  }

  if (questions.length === 0) return <div className="p-8 text-center text-wall-text-muted">该类型暂无题目</div>

  const currentQ = questions[currentIdx]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => {
          setSelectedCategory(null)
          setQuestions([])
          setCurrentIdx(0)
          setAnswers({})
        }}
        className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> 返回类型选择
      </button>

      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle size={24} className="text-wall-gold" />
          <h1 className="text-2xl font-serif text-wall-text tracking-wider">
            {unit.unit_name} - {selectedCategory}
          </h1>
        </div>
        <SealBadge>第 {unit.unit_id} 单元</SealBadge>
        {sessionId && <p className="text-wall-text-muted text-xs mt-1">课堂记录已自动保存</p>}
        {creating && <p className="text-wall-text-muted text-xs mt-1">正在创建课堂记录...</p>}
      </div>

      <GreatWallDivider />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left: Question display */}
        <div className="lg:col-span-2">
          <div className="bg-wall-paper border-2 border-wall-gold/40 rounded-lg p-8 min-h-[300px] flex flex-col items-center justify-center relative">
            <div className="absolute top-4 right-4 text-wall-text-muted text-sm font-serif">
              {currentIdx + 1} / {questions.length}
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-serif text-wall-text mb-6">{currentQ.content}</p>
              <p className="text-wall-text-muted text-sm">答案：{currentQ.answer}{currentQ.answer_remainder ? ` … 余 ${currentQ.answer_remainder}` : ''}</p>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded border border-wall-border text-wall-text-muted hover:bg-wall-bg-deep disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={14} /> 上一题
              </button>
              <button
                onClick={() => currentIdx < questions.length - 1 && setCurrentIdx(currentIdx + 1)}
                disabled={currentIdx === questions.length - 1}
                className="px-4 py-2 rounded border border-wall-border text-wall-text-muted hover:bg-wall-bg-deep disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                下一题 <ArrowRight size={14} />
              </button>
              <button
                onClick={skipQuestion}
                className="px-4 py-2 rounded border border-wall-border text-wall-text-muted hover:bg-wall-bg-deep transition-colors flex items-center gap-1"
              >
                <SkipForward size={14} /> 跳过
              </button>
            </div>
          </div>

          {/* Mark area */}
          <div className="bg-wall-bg-deep border border-wall-border rounded-lg p-5 mt-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="输入学号（如01）"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                className="w-full sm:w-40 px-3 py-2 bg-wall-paper border border-wall-border rounded text-wall-text font-serif focus:outline-none focus:border-wall-brick"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <SealButton variant="solid" onClick={() => markAnswer(true)} className="flex-1 sm:flex-none">
                  <Check size={14} className="mr-1" /> 答对
                </SealButton>
                <SealButton variant="outline" onClick={() => markAnswer(false)} className="flex-1 sm:flex-none">
                  <X size={14} className="mr-1" /> 答错
                </SealButton>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div>
          <ScrollPanel title="本节课统计">
            {stats.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {stats.map((s) => (
                  <div key={s.number} className="bg-wall-paper border border-wall-border rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif text-wall-text font-medium">{s.number}号</span>
                      <span className="text-sm text-wall-text-muted">{s.correct}/{s.total}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {(answers[s.number] || []).map((a, i) => (
                        <span
                          key={i}
                          className={`inline-block w-5 h-5 rounded text-xs flex items-center justify-center ${
                            a.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {a.is_correct ? '✓' : '✗'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-wall-text-muted text-sm text-center py-4">暂无答题记录</p>
            )}
          </ScrollPanel>
        </div>
      </div>
    </div>
  )
}
