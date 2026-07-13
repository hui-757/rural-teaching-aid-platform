import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import type { Unit, Question, AnswerItem } from '../types'
import { BrickCard, ScrollPanel } from '../components/ui/BrickCard'
import { SealButton, SealBadge, GoldBadge } from '../components/ui/SealButton'
import {
  Trophy, Lock, Unlock, Timer, ArrowRight, CheckCircle, XCircle,
  Loader2, Crown, RotateCcw, ChevronLeft, Save
} from 'lucide-react'

const LEVEL_CONFIG = [
  { timeLimit: 60, targetAccuracy: 0.5, consecutiveRequired: 2, questionCount: 5 },
  { timeLimit: 60, targetAccuracy: 0.6, consecutiveRequired: 2, questionCount: 5 },
  { timeLimit: 60, targetAccuracy: 0.7, consecutiveRequired: 3, questionCount: 6 },
  { timeLimit: 60, targetAccuracy: 0.7, consecutiveRequired: 3, questionCount: 6 },
  { timeLimit: 60, targetAccuracy: 0.8, consecutiveRequired: 3, questionCount: 7 },
  { timeLimit: 60, targetAccuracy: 0.8, consecutiveRequired: 4, questionCount: 7 },
  { timeLimit: 60, targetAccuracy: 0.8, consecutiveRequired: 4, questionCount: 8 },
  { timeLimit: 60, targetAccuracy: 0.9, consecutiveRequired: 4, questionCount: 8 },
  { timeLimit: 60, targetAccuracy: 0.9, consecutiveRequired: 5, questionCount: 9 },
  { timeLimit: 60, targetAccuracy: 1.0, consecutiveRequired: 5, questionCount: 10 },
]

export default function CompetitionPage() {
  const [searchParams] = useSearchParams()
  const unitParam = searchParams.get('unit')
  const { user } = useAuthStore()
  const { gameState, setGameState } = useAppStore()

  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [answers, setAnswers] = useState<AnswerItem[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isPass, setIsPass] = useState(false)
  const [note, setNote] = useState('')
  const [rankings, setRankings] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [completedLevels, setCompletedLevels] = useState<number[]>([])

  useEffect(() => {
    fetchUnits()
    if (unitParam) {
      selectUnitById(Number(unitParam))
    }
  }, [unitParam])

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft])

  const fetchUnits = async () => {
    const { data } = await supabase.from('unit').select('*').eq('grade', 4).order('unit_number')
    if (data) setUnits(data as Unit[])
    setLoading(false)
  }

  const selectUnitById = async (id: number) => {
    const { data } = await supabase.from('unit').select('*').eq('id', id).single()
    if (data) {
      setSelectedUnit(data as Unit)
      loadQuestions(data.id)
    }
  }

  const loadQuestions = async (unitId: number) => {
    const { data } = await supabase.from('question').select('*').eq('unit_id', unitId)
    if (data) setQuestions(data as Question[])
  }

  const startLevel = async (level: number) => {
    if (!selectedUnit) return
    const config = LEVEL_CONFIG[level - 1] || LEVEL_CONFIG[0]

    // Filter questions by difficulty for this level
    const levelQuestions = questions
      .filter((q) => {
        if (level <= 3) return q.difficulty <= 1
        if (level <= 6) return q.difficulty <= 2
        return true
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, config.questionCount)

    if (levelQuestions.length === 0) {
      // Fallback to all questions
      const fallback = [...questions].sort(() => Math.random() - 0.5).slice(0, config.questionCount)
      if (fallback.length === 0) {
        alert('暂无题目，请先录入题库')
        return
      }
      levelQuestions.push(...fallback)
    }

    setCurrentQIndex(0)
    setCurrentAnswer('')
    setAnswers([])
    setTimeLeft(config.timeLimit)
    setIsPlaying(true)
    setShowResult(false)
    setShowNameInput(true)
  }

  const submitAnswer = () => {
    const q = getCurrentQuestions()[currentQIndex]
    if (!q) return

    const correct = currentAnswer.trim() === q.answer.trim()
    const newAnswer: AnswerItem = {
      question_id: q.id,
      student_answer: currentAnswer.trim(),
      correct,
    }

    const newAnswers = [...answers, newAnswer]
    setAnswers(newAnswers)
    setCurrentAnswer('')

    const currentQuestions = getCurrentQuestions()
    if (currentQIndex + 1 < currentQuestions.length) {
      setCurrentQIndex(currentQIndex + 1)
    } else {
      finishLevel(newAnswers)
    }
  }

  const getCurrentQuestions = () => {
    const config = LEVEL_CONFIG[gameState.currentLevel - 1] || LEVEL_CONFIG[0]
    return questions
      .filter((q) => {
        if (gameState.currentLevel <= 3) return q.difficulty <= 1
        if (gameState.currentLevel <= 6) return q.difficulty <= 2
        return true
      })
      .slice(0, config.questionCount)
  }

  const finishLevel = (finalAnswers: AnswerItem[]) => {
    const config = LEVEL_CONFIG[gameState.currentLevel - 1] || LEVEL_CONFIG[0]
    const correctCount = finalAnswers.filter((a) => a.correct).length
    const accuracy = correctCount / finalAnswers.length

    // Check consecutive correct
    let maxConsecutive = 0
    let currentConsecutive = 0
    for (const a of finalAnswers) {
      if (a.correct) {
        currentConsecutive++
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
      } else {
        currentConsecutive = 0
      }
    }

    const passed = accuracy >= config.targetAccuracy && maxConsecutive >= config.consecutiveRequired
    setIsPass(passed)
    setShowResult(true)
    setIsPlaying(false)
  }

  const saveRecord = async () => {
    if (!user || !selectedUnit) return
    setSaving(true)

    const correctCount = answers.filter((a) => a.correct).length
    const score = Math.round((correctCount / answers.length) * 100)

    await supabase.from('record').insert({
      teacher_id: user.id,
      student_name: studentName || '匿名学生',
      unit_id: selectedUnit.id,
      level: gameState.currentLevel,
      score,
      answers_json: answers,
      note: note || '',
    })

    if (isPass) {
      setCompletedLevels((prev) => [...prev, gameState.currentLevel])
    }

    setSaving(false)
    setShowResult(false)
    setShowNameInput(false)
    setNote('')
    fetchRankings(selectedUnit.id)
  }

  const fetchRankings = async (unitId: number) => {
    const { data } = await supabase
      .from('record')
      .select('*')
      .eq('unit_id', unitId)
      .order('score', { ascending: false })
      .limit(20)
    if (data) setRankings(data)
  }

  const resetLevelProgress = () => {
    setCompletedLevels([])
    setGameState({ currentLevel: 1 })
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

  // Unit selection screen
  if (!selectedUnit) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} className="text-wall-gold" />
            <h1 className="text-2xl font-serif text-wall-text tracking-wider">闯关竞赛</h1>
          </div>
          <p className="text-wall-text-muted">请选择闯关单元</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit) => (
            <BrickCard
              key={unit.id}
              title={unit.title}
              subtitle={unit.description}
              accent="gold"
              hover
              onClick={() => {
                setSelectedUnit(unit)
                loadQuestions(unit.id)
              }}
            >
              <div className="flex items-center gap-2">
                <GoldBadge>第 {unit.unit_number} 单元</GoldBadge>
                <SealBadge>10 关卡</SealBadge>
              </div>
            </BrickCard>
          ))}
        </div>
      </div>
    )
  }

  // Name input before starting
  if (showNameInput && !isPlaying) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setSelectedUnit(null)}
          className="flex items-center gap-1 text-wall-text-muted hover:text-wall-text mb-4 text-sm"
        >
          <ChevronLeft size={16} /> 返回单元选择
        </button>
        <div className="max-w-md mx-auto">
          <ScrollPanel title="学生信息">
            <p className="text-wall-text-muted text-sm mb-4">
              请填写参与闯关的学生姓名，以便记录成绩和排行。
            </p>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="请输入学生姓名"
              className="w-full px-4 py-3 bg-wall-paper border-2 border-wall-border rounded font-sans text-wall-text placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-gold transition-colors mb-4"
            />
            <SealButton
              variant="gold"
              size="md"
              className="w-full"
              onClick={() => {
                if (!studentName.trim()) {
                  alert('请输入学生姓名')
                  return
                }
                setShowNameInput(false)
                setIsPlaying(true)
              }}
            >
              <ArrowRight size={16} className="mr-2" />
              开始闯关
            </SealButton>
          </ScrollPanel>
        </div>
      </div>
    )
  }

  // Level selection screen
  if (!isPlaying && !showResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setSelectedUnit(null)}
          className="flex items-center gap-1 text-wall-text-muted hover:text-wall-text mb-4 text-sm"
        >
          <ChevronLeft size={16} /> 返回单元选择
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} className="text-wall-gold" />
            <h1 className="text-2xl font-serif text-wall-text tracking-wider">{selectedUnit.title} - 闯关</h1>
          </div>
          <div className="flex items-center gap-2">
            <GoldBadge>第 {selectedUnit.unit_number} 单元</GoldBadge>
            <SealButton variant="outline" size="sm" onClick={resetLevelProgress}>
              <RotateCcw size={12} className="mr-1" />
              重置进度
            </SealButton>
          </div>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
            const isCompleted = completedLevels.includes(level)
            const isAvailable = level === 1 || completedLevels.includes(level - 1)
            const config = LEVEL_CONFIG[level - 1]

            return (
              <button
                key={level}
                disabled={!isAvailable}
                onClick={() => {
                  setGameState({ currentLevel: level })
                  startLevel(level)
                }}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                  isCompleted
                    ? 'bg-wall-gold/10 border-wall-gold cursor-pointer hover:bg-wall-gold/20'
                    : isAvailable
                    ? 'bg-wall-paper border-wall-brick cursor-pointer hover:bg-wall-brick/5 hover:-translate-y-1 hover:shadow-lg'
                    : 'bg-wall-bg-deep border-wall-border opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  {isCompleted ? (
                    <Crown size={24} className="mx-auto mb-1 text-wall-gold" />
                  ) : isAvailable ? (
                    <Unlock size={24} className="mx-auto mb-1 text-wall-brick" />
                  ) : (
                    <Lock size={24} className="mx-auto mb-1 text-wall-text-muted" />
                  )}
                  <p className="font-serif font-bold text-lg text-wall-text">第 {level} 关</p>
                  <p className="text-xs text-wall-text-muted mt-1">
                    {config?.questionCount}题 · {config?.timeLimit}秒
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Rankings */}
        <ScrollPanel title="闯关排行榜">
          {rankings.length > 0 ? (
            <div className="space-y-2">
              {rankings.map((r, i) => (
                <div
                  key={r.id as number}
                  className="flex items-center justify-between p-3 bg-wall-bg-deep rounded border border-wall-border"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-wall-gold text-wall-paper' :
                      i === 1 ? 'bg-wall-stone text-wall-paper' :
                      i === 2 ? 'bg-wall-brick text-wall-paper' :
                      'bg-wall-border text-wall-text-muted'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="font-serif text-wall-text">{r.student_name as string}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-wall-text-muted text-sm">第 {r.level as number} 关</span>
                    <span className="font-serif font-bold text-wall-brick">{r.score as number} 分</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-wall-text-muted py-4">暂无闯关记录</p>
          )}
        </ScrollPanel>
      </div>
    )
  }

  // Playing screen
  const currentQuestions = getCurrentQuestions()
  const currentQuestion = currentQuestions[currentQIndex]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-wall-stone-dark text-wall-paper rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SealBadge className="bg-wall-gold/20 text-wall-gold-light border-wall-gold/30">
            第 {gameState.currentLevel} 关
          </SealBadge>
          <span className="font-serif text-sm">{studentName}</span>
        </div>
        <div className={`flex items-center gap-2 font-mono text-lg font-bold ${
          timeLeft <= 10 ? 'text-red-400' : 'text-wall-gold-light'
        }`}>
          <Timer size={18} />
          {timeLeft}秒
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4 flex gap-1">
        {currentQuestions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < currentQIndex
                ? answers[i]?.correct
                  ? 'bg-wall-ink'
                  : 'bg-wall-brick'
                : i === currentQIndex
                ? 'bg-wall-gold'
                : 'bg-wall-border'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="bg-wall-paper border-2 border-wall-border rounded-lg p-8 brick-pattern mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-wall-text-muted text-sm">题目 {currentQIndex + 1} / {currentQuestions.length}</span>
          <SealBadge>难度 {currentQuestion?.difficulty || 1}</SealBadge>
        </div>
        <p className="text-2xl font-serif text-wall-text text-center py-8">
          {currentQuestion?.content || '加载中...'}
        </p>
      </div>

      {/* Answer Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && currentAnswer.trim() && submitAnswer()}
          placeholder="请输入答案"
          autoFocus
          className="flex-1 px-4 py-3 bg-wall-paper border-2 border-wall-border rounded font-sans text-lg text-wall-text text-center placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-gold transition-colors"
        />
        <SealButton
          variant="gold"
          size="md"
          onClick={submitAnswer}
          disabled={!currentAnswer.trim()}
        >
          <ArrowRight size={18} />
        </SealButton>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-wall-paper border-2 border-wall-brick rounded-lg max-w-md w-full p-6 shadow-2xl animate-fade-in-up">
            <div className="text-center mb-4">
              {isPass ? (
                <>
                  <Crown size={48} className="mx-auto text-wall-gold mb-2" />
                  <h2 className="text-2xl font-serif text-wall-gold font-bold">闯关成功</h2>
                </>
              ) : (
                <>
                  <XCircle size={48} className="mx-auto text-wall-brick mb-2" />
                  <h2 className="text-2xl font-serif text-wall-brick font-bold">闯关失败</h2>
                </>
              )}
              <p className="text-wall-text-muted mt-2">
                答对 {answers.filter((a) => a.correct).length} / {answers.length} 题
              </p>
            </div>

            <div className="bg-wall-bg-deep rounded p-3 mb-4 space-y-2">
              {answers.map((a, i) => {
                const q = currentQuestions.find((q) => q.id === a.question_id)
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {a.correct ? (
                      <CheckCircle size={14} className="text-wall-ink flex-shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-wall-brick flex-shrink-0" />
                    )}
                    <span className="text-wall-text-muted">{q?.content}</span>
                    <span className={a.correct ? 'text-wall-ink' : 'text-wall-brick'}>
                      {a.student_answer} {a.correct ? '' : `(正确答案: ${q?.answer})`}
                    </span>
                  </div>
                )
              })}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="教师备注（可选）..."
              rows={3}
              className="w-full px-3 py-2 bg-wall-paper border-2 border-wall-border rounded font-sans text-wall-text placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-brick transition-colors mb-4 resize-none"
            />

            <div className="flex gap-3">
              <SealButton
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => {
                  setShowResult(false)
                  setIsPlaying(false)
                }}
              >
                返回关卡
              </SealButton>
              <SealButton
                variant="solid"
                size="md"
                className="flex-1"
                onClick={saveRecord}
                disabled={saving}
              >
                <Save size={14} className="mr-1" />
                {saving ? '保存中...' : '保存记录'}
              </SealButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
