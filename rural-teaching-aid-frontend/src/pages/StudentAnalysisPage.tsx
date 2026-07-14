import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { ScrollPanel } from '../components/ui/BrickCard'
import { Users, ArrowLeft, Loader2, TrendingUp, Award, BookOpen, MessageCircle, Trophy } from 'lucide-react'

interface PracticeStudent {
  student_number: string
  sessions: number      // 参与课堂次数 (distinct session_id)
  questions: number     // 总答题数
  correct: number       // 正确数
}

interface CompetitionStudent {
  student_name: string
  count: number         // 闯关次数
  avg_score: number     // 平均分
}

interface SessionRow {
  id: string
  session_label: string
  unit_name: string
  created_at: string
}

export default function StudentAnalysisPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [practiceStudents, setPracticeStudents] = useState<PracticeStudent[]>([])
  const [competitionStudents, setCompetitionStudents] = useState<CompetitionStudent[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)

    // 1. 一起练：拉取所有答题记录，前端按学号聚合
    const { data: paData } = await supabase
      .from('practice_answer')
      .select('student_number, is_correct, session_id')
      .eq('teacher_id', user!.id)

    if (paData) {
      const map: Record<string, { sessions: Set<string>; questions: number; correct: number }> = {}
      for (const row of paData) {
        const num = row.student_number
        if (!map[num]) map[num] = { sessions: new Set(), questions: 0, correct: 0 }
        map[num].sessions.add(row.session_id)
        map[num].questions++
        if (row.is_correct) map[num].correct++
      }
      const list = Object.entries(map).map(([student_number, v]) => ({
        student_number,
        sessions: v.sessions.size,
        questions: v.questions,
        correct: v.correct,
      }))
      list.sort((a, b) => Number(a.student_number) - Number(b.student_number))
      setPracticeStudents(list)
    }

    // 2. 闯关：拉取所有记录，前端按姓名聚合
    const { data: recordData } = await supabase
      .from('record')
      .select('student_name, score')
      .eq('teacher_id', user!.id)

    if (recordData) {
      const map: Record<string, { count: number; total: number }> = {}
      for (const row of recordData) {
        const name = row.student_name || '匿名'
        if (!map[name]) map[name] = { count: 0, total: 0 }
        map[name].count++
        map[name].total += row.score || 0
      }
      const list = Object.entries(map).map(([student_name, v]) => ({
        student_name,
        count: v.count,
        avg_score: v.count > 0 ? v.total / v.count : 0,
      }))
      list.sort((a, b) => b.avg_score - a.avg_score)
      setCompetitionStudents(list)
    }

    // 3. 课堂记录
    const { data: sessData } = await supabase
      .from('practice_session')
      .select('id, session_label, created_at, unit_id')
      .eq('teacher_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (sessData) {
      const enriched = await Promise.all(
        sessData.map(async (s: any) => {
          const { data: u } = await supabase.from('unit').select('unit_name').eq('unit_id', s.unit_id).single()
          return { id: s.id, session_label: s.session_label, unit_name: u?.unit_name || '未知单元', created_at: s.created_at } as SessionRow
        })
      )
      setSessions(enriched)
    }

    setLoading(false)
  }

  const overallPracticeRate =
    practiceStudents.length > 0
      ? (
          (practiceStudents.reduce((s, st) => s + st.correct, 0) /
            Math.max(practiceStudents.reduce((s, st) => s + st.questions, 0), 1)) *
          100
        ).toFixed(1)
      : '0.0'

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
        onClick={() => navigate('/teach')}
        className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> 返回授课中心
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users size={24} className="text-wall-brick" />
          <h1 className="text-2xl font-serif text-wall-text tracking-wider">学情分析</h1>
        </div>
        <p className="text-wall-text-muted">实时聚合学生课堂参与与闯关数据</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-wall-paper border-2 border-wall-brick/30 rounded-lg p-4 text-center">
          <BookOpen size={20} className="mx-auto mb-2 text-wall-brick" />
          <p className="text-2xl font-serif text-wall-text">{practiceStudents.length}</p>
          <p className="text-xs text-wall-text-muted">一起练活跃标识</p>
        </div>
        <div className="bg-wall-paper border-2 border-wall-gold/30 rounded-lg p-4 text-center">
          <TrendingUp size={20} className="mx-auto mb-2 text-wall-gold" />
          <p className="text-2xl font-serif text-wall-text">{overallPracticeRate}%</p>
          <p className="text-xs text-wall-text-muted">一起练平均正确率</p>
        </div>
        <div className="bg-wall-paper border-2 border-wall-ink/30 rounded-lg p-4 text-center">
          <Trophy size={20} className="mx-auto mb-2 text-wall-ink" />
          <p className="text-2xl font-serif text-wall-text">{competitionStudents.length}</p>
          <p className="text-xs text-wall-text-muted">闯关参与人数</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 一起练学情 */}
        <ScrollPanel title="一起练 · 标识统计">
          {practiceStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-wall-border text-wall-text-muted font-serif">
                    <th className="text-left py-2 px-2">标识</th>
                    <th className="text-center py-2 px-2">参与课堂</th>
                    <th className="text-center py-2 px-2">答题数</th>
                    <th className="text-center py-2 px-2">正确率</th>
                  </tr>
                </thead>
                <tbody>
                  {practiceStudents.map((s) => {
                    const rate = s.questions > 0 ? ((s.correct / s.questions) * 100).toFixed(1) : '0.0'
                    return (
                      <tr key={s.student_number} className="border-b border-wall-border/50 hover:bg-wall-bg-deep/50">
                        <td className="py-2 px-2 font-medium text-wall-text">{s.student_number}</td>
                        <td className="py-2 px-2 text-center text-wall-text-soft">{s.sessions}</td>
                        <td className="py-2 px-2 text-center text-wall-text-soft">{s.questions}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`font-medium ${Number(rate) >= 80 ? 'text-green-600' : Number(rate) >= 60 ? 'text-wall-gold' : 'text-red-500'}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-wall-text-muted text-sm text-center py-4">暂无一起练数据，请在课堂互动中记录标识答题</p>
          )}
        </ScrollPanel>

        {/* 闯关统计 */}
        <ScrollPanel title="闯关 · 标识统计">
          {competitionStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-wall-border text-wall-text-muted font-serif">
                    <th className="text-left py-2 px-2">标识</th>
                    <th className="text-center py-2 px-2">闯关次数</th>
                    <th className="text-center py-2 px-2">平均分</th>
                  </tr>
                </thead>
                <tbody>
                  {competitionStudents.map((s) => (
                    <tr key={s.student_name} className="border-b border-wall-border/50 hover:bg-wall-bg-deep/50">
                      <td className="py-2 px-2 font-medium text-wall-text">{s.student_name}</td>
                      <td className="py-2 px-2 text-center text-wall-text-soft">{s.count}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`font-medium ${s.avg_score >= 80 ? 'text-green-600' : s.avg_score >= 60 ? 'text-wall-gold' : 'text-red-500'}`}>
                          {s.avg_score.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-wall-text-muted text-sm text-center py-4">暂无闯关数据</p>
          )}
        </ScrollPanel>
      </div>

      {/* 课堂记录 */}
      <ScrollPanel title="一起练课堂记录">
        {sessions.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {sessions.map((s) => (
              <div key={s.id} className="bg-wall-paper border border-wall-border rounded p-3">
                <p className="font-serif text-wall-text text-sm">{s.session_label}</p>
                <p className="text-xs text-wall-text-muted mt-1">{s.unit_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-wall-text-muted text-sm text-center py-4">暂无课堂记录</p>
        )}
      </ScrollPanel>
    </div>
  )
}
