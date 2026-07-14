import { useEffect, useState, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import type { CalcQuestion, AnswerItem, VerticalContent, Unit } from '../types'
import { ScrollPanel } from '../components/ui/BrickCard'
import WorldMap from '../components/maps/WorldMap'
import { SealButton, SealBadge, GoldBadge } from '../components/ui/SealButton'
import {
  Trophy, Lock, Unlock, Timer, ArrowRight, CheckCircle, XCircle,
  Loader2, Crown, RotateCcw, ChevronLeft, Calculator,
} from 'lucide-react'

/** 9 个地界 → 9 个计算题分类（按取经顺序） */
const UNIT_TO_CATEGORY: Record<number, string> = {
  1: '口算乘法',
  2: '不进位笔算乘法',
  3: '连续进位笔算乘法',
  4: '中间有0的乘法',
  5: '末尾有0的乘法',
  6: '积的变化规律',
  7: '乘法估算与数学文化',
  8: '口算除法',
  9: '笔算除法竖式',
}

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

const LEVEL_CONFIG = [
  { timeLimit: 60, targetAccuracy: 0.15, consecutiveRequired: 1, questionCount: 3 },
  { timeLimit: 60, targetAccuracy: 0.175, consecutiveRequired: 1, questionCount: 3 },
  { timeLimit: 60, targetAccuracy: 0.175, consecutiveRequired: 1, questionCount: 3 },
  { timeLimit: 60, targetAccuracy: 0.2, consecutiveRequired: 2, questionCount: 3 },
  { timeLimit: 60, targetAccuracy: 0.2, consecutiveRequired: 2, questionCount: 4 },
  { timeLimit: 60, targetAccuracy: 0.225, consecutiveRequired: 2, questionCount: 4 },
  { timeLimit: 60, targetAccuracy: 0.225, consecutiveRequired: 2, questionCount: 4 },
  { timeLimit: 60, targetAccuracy: 0.25, consecutiveRequired: 2, questionCount: 4 },
  { timeLimit: 60, targetAccuracy: 0.25, consecutiveRequired: 3, questionCount: 5 },
  { timeLimit: 60, targetAccuracy: 0.275, consecutiveRequired: 3, questionCount: 5 },
]

const formatVertical = (raw: VerticalContent | null) => {
  if (!raw) return ''
  return raw.lines.map(line =>
    line.map(item => {
      if (item.type === 'text') return item.text
      if (item.type === 'blank') return '□'.repeat(item.answer?.length || 1)
      return ''
    }).join('')
  ).join('\n')
}

// 提取所有 blank 的 answer
const getBlankAnswers = (raw: VerticalContent | null): string[] => {
  if (!raw) return []
  const answers: string[] = []
  for (const line of raw.lines) {
    for (const item of line) {
      if (item.type === 'blank') {
        answers.push(item.answer || '')
      }
    }
  }
  return answers
}

const checkPass = (answers: AnswerItem[], config: typeof LEVEL_CONFIG[0]) => {
  if (answers.length < config.questionCount) return false
  const correctCount = answers.filter(a => a.correct).length
  const accuracy = correctCount / answers.length
  let maxConsecutive = 0
  let currentConsecutive = 0
  for (const a of answers) {
    if (a.correct) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    } else {
      currentConsecutive = 0
    }
  }
  return accuracy >= config.targetAccuracy && maxConsecutive >= config.consecutiveRequired
}

// 交互式竖式组件：blank 可含多位数字，按 answer 长度跨格对齐
const VerticalInputs = ({
  raw,
  values,
  onChange,
}: {
  raw: VerticalContent
  values: string[]
  onChange: (idx: number, val: string) => void
}) => {
  // 从第一行推导总列数（text 字符数 + blank 占用格数 = answer 长度）
  const firstLine = raw.lines[0] || []
  const totalCols = firstLine.reduce((sum, item) => {
    if (item.type === 'text') return sum + item.text.length
    if (item.type === 'blank') return sum + (item.answer?.length || 1)
    return sum
  }, 0)

  let blankIdx = 0

  return (
    <div className="flex flex-col items-center font-mono text-2xl select-none py-2">
      {raw.lines.map((line, li) => {
        const cells: React.ReactNode[] = []
        let colCount = 0

        line.forEach((item, ii) => {
          if (item.type === 'text') {
            const chars = item.text.split('')
            chars.forEach((ch, ci) => {
              cells.push(
                <div key={`t-${li}-${ii}-${ci}`} className="w-8 h-8 flex items-center justify-center">
                  <span className="text-wall-text">
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                </div>
              )
              colCount++
            })
          } else if (item.type === 'blank') {
            const idx = blankIdx++
            const len = item.answer?.length || 1
            cells.push(
              <div key={`b-${li}-${ii}`} className="h-8 flex items-center justify-center" style={{ width: `${len * 32}px` }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={len}
                  value={values[idx] || ''}
                  onChange={(e) =>
                    onChange(idx, e.target.value.replace(/[^0-9]/g, '').slice(0, len))
                  }
                  className="h-7 text-center border-b-2 border-wall-border bg-transparent text-wall-text focus:border-wall-gold outline-none transition-colors"
                  style={{ width: `${len * 32 - 8}px` }}
                />
              </div>
            )
            colCount += len
          }
        })

        // 尾部补空格到统一宽度
        while (colCount < totalCols) {
          cells.push(
            <div key={`pad-${li}-${colCount}`} className="w-8 h-8 flex items-center justify-center">
              <span className="text-wall-text">{'\u00A0'}</span>
            </div>
          )
          colCount++
        }

        return (
          <div key={li} className="flex items-center">
            {cells}
          </div>
        )
      })}
    </div>
  )
}

export default function CompetitionPage() {
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const { user } = useAuthStore()
  const { gameState, setGameState, currentGrade } = useAppStore()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam)
  const [questions, setQuestions] = useState<CalcQuestion[]>([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [currentRemainder, setCurrentRemainder] = useState('')
  const [answers, setAnswers] = useState<AnswerItem[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isPass, setIsPass] = useState(false)
  const [note, setNote] = useState('')
  const [rankings, setRankings] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [studentName, setStudentName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [completedLevels, setCompletedLevels] = useState<Record<string, number[]>>({})
  const [blankValues, setBlankValues] = useState<string[]>([])

  const finishedRef = useRef(false)
  const answerInputRef = useRef<HTMLInputElement>(null)

  // 虚拟地图单元（9 个地界）
  const mapUnits = useMemo<Unit[]>(() => [
    { unit_id: 1, unit_name: '花果山', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
    { unit_id: 2, unit_name: '高老庄', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
    { unit_id: 3, unit_name: '流沙河', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
    { unit_id: 4, unit_name: '白虎岭', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
    { unit_id: 5, unit_name: '盘丝洞', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
    { unit_id: 6, unit_name: '火焰山', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
    { unit_id: 7, unit_name: '通天河', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
    { unit_id: 8, unit_name: '乌鸡国', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
    { unit_id: 9, unit_name: '大雷音寺', unit_desc: null, grade: currentGrade || '四年级上', has_test: false, created_at: '' },
  ], [currentGrade])

  // 已通关地界 unit_id（该分类所有 10 关全部通过）
  const completedUnitIds = useMemo(() => {
    const result: number[] = []
    Object.entries(UNIT_TO_CATEGORY).forEach(([unitIdStr, category]) => {
      const passedLevels = completedLevels[category] || []
      const allPassed = Array.from({ length: 10 }, (_, i) => i + 1).every(l => passedLevels.includes(l))
      if (allPassed) result.push(parseInt(unitIdStr))
    })
    return result
  }, [completedLevels])

  useEffect(() => {
    const q = getCurrentQuestion()
    if (isPlaying && !(q?.type === 'vertical' && q?.raw_content && q?.category !== '笔算除法竖式')) {
      answerInputRef.current?.focus()
    }
  }, [currentQIndex, isPlaying])

  // 切换题目时重置 blank 值
  useEffect(() => {
    setBlankValues([])
  }, [currentQIndex])

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
      loadQuestions(categoryParam)
    }
    setLoading(false)
  }, [categoryParam])

  useEffect(() => {
    if (selectedCategory && user) {
      loadCompletedLevels(selectedCategory)
      fetchRankings(selectedCategory)
    }
  }, [selectedCategory, user])

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft])

  useEffect(() => {
    if (isPlaying && timeLeft <= 0 && !finishedRef.current) {
      finishLevel(answers)
    }
  }, [isPlaying, timeLeft, answers])

  const loadCompletedLevels = async (category: string) => {
    if (!user || !currentGrade) return
    const { data } = await supabase
      .from('record')
      .select('level, score')
      .eq('teacher_id', user.id)
      .eq('category', category)
      .eq('grade', currentGrade)

    if (!data) return
    const passedLevels = data
      .filter((r) => {
        const config = LEVEL_CONFIG[(r.level || 1) - 1]
        return r.score >= (config?.targetAccuracy || 0.5) * 100
      })
      .map((r) => r.level as number)

    const uniqueLevels = [...new Set(passedLevels)]
    setCompletedLevels((prev) => ({ ...prev, [category]: uniqueLevels }))
  }

  const loadQuestions = async (category: string) => {
    const grade = currentGrade || '四年级上'
    const { data } = await supabase.from('calc_question').select('*').eq('category', category).eq('grade', grade)
    if (data) {
      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setQuestions(shuffled as CalcQuestion[])
      return shuffled.length > 0
    }
    return false
  }

  const startLevel = async (level: number) => {
    if (!selectedCategory) return
    const config = LEVEL_CONFIG[level - 1] || LEVEL_CONFIG[0]

    const hasQuestions = await loadQuestions(selectedCategory)
    if (!hasQuestions) {
      alert('该类型暂无题目')
      return
    }

    setCurrentQIndex(0)
    setCurrentAnswer('')
    setCurrentRemainder('')
    setAnswers([])
    setBlankValues([])
    setTimeLeft(config.timeLimit)
    setIsPlaying(false)
    setShowResult(false)
    setShowNameInput(true)
    finishedRef.current = false
  }

  const getCurrentQuestion = () => {
    if (questions.length === 0) return null
    return questions[currentQIndex % questions.length]
  }

  const handleBlankChange = (idx: number, val: string) => {
    setBlankValues((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  const submitAnswer = () => {
    const q = getCurrentQuestion()
    if (!q) return

    // 乘法竖式 blank 输入（多位数字一个空）
    if (q.type === 'vertical' && q.raw_content && q.category !== '笔算除法竖式') {
      const correctAnswers = getBlankAnswers(q.raw_content)
      let allCorrect = true
      for (let i = 0; i < correctAnswers.length; i++) {
        if (blankValues[i] !== correctAnswers[i]) {
          allCorrect = false
          break
        }
      }

      const studentAnswer = blankValues.join('')
      const newAnswer: AnswerItem = {
        question_id: q.id,
        student_answer: studentAnswer,
        correct: allCorrect,
      }

      const newAnswers = [...answers, newAnswer]
      setAnswers(newAnswers)
      setBlankValues([])

      const config = LEVEL_CONFIG[gameState.currentLevel - 1] || LEVEL_CONFIG[0]
      if (checkPass(newAnswers, config)) {
        finishLevel(newAnswers)
      } else {
        setCurrentQIndex((prev) => prev + 1)
      }
      return
    }

    // 除法竖式（旧逻辑）或普通口算题
    let correct = currentAnswer.trim() === q.answer.trim()
    if (q.category === '笔算除法竖式' && q.answer_remainder) {
      correct = correct && currentRemainder.trim() === q.answer_remainder.trim()
    }

    const newAnswer: AnswerItem = {
      question_id: q.id,
      student_answer: currentAnswer.trim() + (q.answer_remainder ? `...${currentRemainder.trim()}` : ''),
      correct,
    }

    const newAnswers = [...answers, newAnswer]
    setAnswers(newAnswers)
    setCurrentAnswer('')
    setCurrentRemainder('')

    const config = LEVEL_CONFIG[gameState.currentLevel - 1] || LEVEL_CONFIG[0]
    if (checkPass(newAnswers, config)) {
      finishLevel(newAnswers)
    } else {
      setCurrentQIndex((prev) => prev + 1)
    }
  }

  const finishLevel = async (finalAnswers: AnswerItem[]) => {
    if (finishedRef.current) return
    finishedRef.current = true

    const config = LEVEL_CONFIG[gameState.currentLevel - 1] || LEVEL_CONFIG[0]
    const passed = checkPass(finalAnswers, config)

    setIsPass(passed)
    setShowResult(true)
    setIsPlaying(false)

    if (passed && selectedCategory) {
      setCompletedLevels((prev) => ({
        ...prev,
        [selectedCategory]: [...new Set([...(prev[selectedCategory] || []), gameState.currentLevel])],
      }))
    }

    // 自动保存记录
    if (user && selectedCategory && currentGrade) {
      const correctCount = finalAnswers.filter((a) => a.correct).length
      const score = finalAnswers.length > 0 ? Math.round((correctCount / finalAnswers.length) * 100) : 0

      const { data: inserted, error } = await supabase
        .from('record')
        .insert({
          teacher_id: user.id,
          student_name: studentName || '匿名',
          category: selectedCategory,
          grade: currentGrade,
          level: gameState.currentLevel,
          score,
          answers_json: finalAnswers,
        })
        .select('record_id')
        .single()

      if (!error && inserted && note.trim()) {
        await supabase.from('note').insert({
          record_id: inserted.record_id,
          content: note.trim(),
        })
      }

      fetchRankings(selectedCategory)
    }
  }

  const fetchRankings = async (category: string) => {
    if (!currentGrade) return
    const { data } = await supabase
      .from('record')
      .select('*')
      .eq('category', category)
      .eq('grade', currentGrade)
      .order('score', { ascending: false })
      .limit(20)
    if (data) setRankings(data)
  }

  const resetLevelProgress = () => {
    if (!selectedCategory) return
    if (!confirm('确定重置该类型的闯关进度？这将清除解锁状态，但历史记录仍保留。')) return
    setCompletedLevels((prev) => ({ ...prev, [selectedCategory]: [] }))
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

  // WorldMap entry
  if (!selectedCategory) {
    return (
      <div className="h-[calc(100vh-64px-88px)] flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 shrink-0 w-full">
          <div className="flex items-center gap-3 mb-1">
            <Trophy size={24} className="text-wall-gold" />
            <h1 className="text-2xl font-serif text-wall-text tracking-wider">闯关竞赛</h1>
          </div>
          <p className="text-wall-text-muted text-sm">点击地界开始闯关</p>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-4 overflow-hidden">
          <div
            className="relative w-full rounded-2xl overflow-hidden border-2 border-wall-border"
            style={{ aspectRatio: '1920/823', maxHeight: '100%' }}
          >
            <WorldMap
              units={mapUnits}
              completedMaps={completedUnitIds}
              onSelectUnit={(unit) => {
                const cat = UNIT_TO_CATEGORY[unit.unit_id]
                if (cat) {
                  setSelectedCategory(cat)
                  loadQuestions(cat)
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Name input
  if (showNameInput && !isPlaying) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 text-wall-text-muted hover:text-wall-text mb-4 text-sm"
        >
          <ChevronLeft size={16} /> 返回类型选择
        </button>
        <div className="max-w-md mx-auto">
          <ScrollPanel title="标识录入">
            <p className="text-wall-text-muted text-sm mb-4">
              请填写参与闯关的学生标识（如 01、test01），以便记录成绩和排行。
            </p>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="请输入学生标识"
              className="w-full px-4 py-3 bg-wall-paper border-2 border-wall-border rounded font-sans text-wall-text placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-gold transition-colors mb-4"
            />
            <SealButton
              variant="gold"
              size="md"
              className="w-full"
              onClick={() => {
                if (!studentName.trim()) {
                  alert('请输入学生标识')
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

  // Level selection
  if (!isPlaying && !showResult) {
    const catLevels = completedLevels[selectedCategory] || []
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 text-wall-text-muted hover:text-wall-text mb-4 text-sm"
        >
          <ChevronLeft size={16} /> 返回类型选择
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} className="text-wall-gold" />
            <h1 className="text-2xl font-serif text-wall-text tracking-wider">{selectedCategory} - 闯关</h1>
          </div>
          <div className="flex items-center gap-2">
            <GoldBadge>计算题闯关</GoldBadge>
            <SealButton variant="outline" size="sm" onClick={resetLevelProgress}>
              <RotateCcw size={12} className="mr-1" />
              重置进度
            </SealButton>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
            const isCompleted = catLevels.includes(level)
            const isAvailable = level === 1 || catLevels.includes(level - 1)
            const config = LEVEL_CONFIG[level - 1]

            return (
              <button
                key={level}
                disabled={!isAvailable}
                onClick={() => {
                  setGameState({ category: selectedCategory, currentLevel: level })
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
                    {config?.timeLimit}秒 · 正确率{config?.targetAccuracy * 100}%
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <ScrollPanel title="闯关排行榜">
          {rankings.length > 0 ? (
            <div className="space-y-2">
              {rankings.map((r, i) => (
                <div
                  key={r.record_id as number}
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
  const currentQuestion = getCurrentQuestion()
  const isDivision = currentQuestion?.category === '笔算除法竖式'
  const useVerticalInputs = currentQuestion?.type === 'vertical' && currentQuestion?.raw_content && !isDivision
  const blankAnswers = useVerticalInputs ? getBlankAnswers(currentQuestion.raw_content) : []
  const allBlanksFilled = blankValues.length === blankAnswers.length && blankValues.every((v) => v !== undefined && v !== '')
  const config = LEVEL_CONFIG[gameState.currentLevel - 1] || LEVEL_CONFIG[0]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-wall-stone-dark text-wall-paper rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SealBadge className="bg-wall-gold/20 text-wall-gold-light border-wall-gold/30">
            第 {gameState.currentLevel} 关
          </SealBadge>
          <span className="font-serif text-sm">{studentName}</span>
          <span className="text-wall-text-muted text-xs">{selectedCategory}</span>
        </div>
        <div className={`flex items-center gap-2 font-mono text-lg font-bold ${
          timeLeft <= 10 ? 'text-red-400' : 'text-wall-gold-light'
        }`}>
          <Timer size={18} />
          {timeLeft}秒
        </div>
      </div>

      <div className="mb-4 flex gap-1">
        {answers.map((a, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${a.correct ? 'bg-wall-ink' : 'bg-wall-brick'}`}
          />
        ))}
        {Array.from({ length: Math.max(0, config.questionCount - answers.length) }, (_, i) => (
          <div key={`empty-${i}`} className="h-1.5 flex-1 rounded-full bg-wall-border" />
        ))}
      </div>

      <div className="bg-wall-paper border-2 border-wall-border rounded-lg p-8 brick-pattern mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-wall-text-muted text-sm">第 {currentQIndex + 1} 题</span>
          <SealBadge>{selectedCategory}</SealBadge>
        </div>

        {useVerticalInputs && currentQuestion?.raw_content ? (
          <VerticalInputs
            raw={currentQuestion.raw_content}
            values={blankValues}
            onChange={handleBlankChange}
          />
        ) : currentQuestion?.type === 'vertical' ? (
          <pre className="text-2xl font-mono text-wall-text text-center py-8 whitespace-pre-wrap">
            {formatVertical(currentQuestion.raw_content)}
          </pre>
        ) : (
          <div className="text-2xl font-serif text-wall-text text-center py-8">
            {currentQuestion?.content || '加载中...'}
          </div>
        )}

        {/* 逐位 blank 提交按钮 */}
        {useVerticalInputs && (
          <div className="mt-4 text-center">
            <SealButton
              variant="gold"
              size="md"
              onClick={submitAnswer}
              disabled={!allBlanksFilled}
            >
              <ArrowRight size={16} className="mr-1" />
              提交答案
            </SealButton>
          </div>
        )}
      </div>

      {/* 除法或普通题的输入框 */}
      {!useVerticalInputs && (
        <div className="flex gap-3 items-start">
          <div className="flex-1 flex flex-col gap-3">
            <input
              ref={answerInputRef}
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && currentAnswer.trim() && submitAnswer()}
              placeholder={isDivision ? '请输入商' : '请输入答案'}
              className="w-full px-4 py-3 bg-wall-paper border-2 border-wall-border rounded font-sans text-lg text-wall-text text-center placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-gold transition-colors"
            />
            {isDivision && (
              <div className="flex items-center gap-2">
                <span className="text-wall-text-muted text-sm whitespace-nowrap">余数：</span>
                <input
                  type="text"
                  value={currentRemainder}
                  onChange={(e) => setCurrentRemainder(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && currentAnswer.trim() && submitAnswer()}
                  placeholder="请输入余数（没有则填0）"
                  className="flex-1 px-4 py-2 bg-wall-paper border-2 border-wall-border rounded font-sans text-lg text-wall-text text-center placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-gold transition-colors"
                />
              </div>
            )}
          </div>
          <SealButton
            variant="gold"
            size="md"
            onClick={submitAnswer}
            disabled={!currentAnswer.trim()}
            className="self-start"
          >
            <ArrowRight size={18} />
          </SealButton>
        </div>
      )}

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
                答对 {answers.filter(a => a.correct).length} / {answers.length} 题
                {isPass ? ` · 用时 ${config.timeLimit - timeLeft} 秒` : ''}
              </p>
              <p className="text-wall-text-muted text-xs mt-1">
                要求：答够 {config.questionCount} 题 · 正确率 ≥ {config.targetAccuracy * 100}% · 连续正确 ≥ {config.consecutiveRequired} 题
              </p>
            </div>

            <div className="bg-wall-bg-deep rounded p-3 mb-4 space-y-2 max-h-[200px] overflow-y-auto">
              {answers.slice(0, 10).map((a, i) => {
                const q = questions.find(q => q.id === a.question_id)
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {a.correct ? (
                      <CheckCircle size={14} className="text-wall-ink flex-shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-wall-brick flex-shrink-0" />
                    )}
                    <span className="text-wall-text-muted truncate">{q?.content}</span>
                    <span className={a.correct ? 'text-wall-ink' : 'text-wall-brick'}>
                      {a.student_answer} {a.correct ? '' : `(正确答案: ${q?.answer}${q?.answer_remainder ? '...' + q.answer_remainder : ''})`}
                    </span>
                  </div>
                )
              })}
              {answers.length > 10 && (
                <p className="text-wall-text-muted text-xs text-center">... 还有 {answers.length - 10} 题</p>
              )}
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
                  setNote('')
                }}
              >
                返回关卡
              </SealButton>
              <SealButton
                variant="solid"
                size="md"
                className="flex-1"
                onClick={() => {
                  setShowResult(false)
                  setIsPlaying(false)
                  setNote('')
                }}
              >
                确认
              </SealButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
