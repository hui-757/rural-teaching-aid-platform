import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { ScrollPanel } from '../components/ui/BrickCard'
import { Users, ArrowLeft, Loader2, TrendingUp, Award, BookOpen } from 'lucide-react'

interface StudentSummary {
  student_number: string
  practice_sessions: number
  practice_questions: number
  practice_correct: number
  competition_count: number
  competition_avg_score: number
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
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)

    // 1. Load aggregated student stats
    const { data: statsData } = await supabase
      .from('student_stats')
      .select('*')
      .eq('teacher_id', user!.id)
      .order('student_number')

    if (statsData) {
      setStudents(statsData as StudentSummary[])
    }

    // 2. Load recent practice sessions with unit names
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
        <p className="text-wall-text-muted">微型用户系统：学生课堂参与度与闯关能力综合分析</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-wall-paper border-2 border-wall-brick/30 rounded-lg p-4 text-center">
          <BookOpen size={20} className="mx-auto mb-2 text-wall-brick" />
          <p className="text-2xl font-serif text-wall-text">{students.length}</p>
          <p className="text-xs text-wall-text-muted">活跃学号</p>
        </div>
        <div className="bg-wall-paper border-2 border-wall-gold/30 rounded-lg p-4 text-center">
          <TrendingUp size={20} className="mx-auto mb-2 text-wall-gold" />
          <p className="text-2xl font-serif text-wall-text">
            {students.length > 0 ? (students.reduce((s, st) => s + st.practice_correct, 0) / Math.max(students.reduce((s, st) => s + st.practice_questions, 0), 1) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-wall-text-muted">一起练平均正确率</p>
        </div>
        <div className="bg-wall-paper border-2 border-wall-ink/30 rounded-lg p-4 text-center">
          <Award size={20} className="mx-auto mb-2 text-wall-ink" />
          <p className="text-2xl font-serif text-wall-text">
            {students.length > 0 ? (students.reduce((s, st) => s + (st.competition_avg_score || 0), 0) / students.length).toFixed(1) : 0}
          </p>
          <p className="text-xs text-wall-text-muted">闯关平均分</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student detail table */}
        <ScrollPanel title="学生综合数据">
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-wall-border text-wall-text-muted font-serif">
                    <th className="text-left py-2 px-2">学号</th>
                    <th className="text-center py-2 px-2">一起练次数</th>
                    <th className="text-center py-2 px-2">答题数</th>
                    <th className="text-center py-2 px-2">正确率</th>
                    <th className="text-center py-2 px-2">闯关次数</th>
                    <th className="text-center py-2 px-2">闯关均分</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const rate = s.practice_questions > 0 ? ((s.practice_correct / s.practice_questions) * 100).toFixed(1) : '0.0'
                    return (
                      <tr key={s.student_number} className="border-b border-wall-border/50 hover:bg-wall-bg-deep/50">
                        <td className="py-2 px-2 font-medium text-wall-text">{s.student_number}号</td>
                        <td className="py-2 px-2 text-center text-wall-text-soft">{s.practice_sessions}</td>
                        <td className="py-2 px-2 text-center text-wall-text-soft">{s.practice_questions}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`font-medium ${Number(rate) >= 80 ? 'text-green-600' : Number(rate) >= 60 ? 'text-wall-gold' : 'text-red-500'}`}>
                            {rate}%
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center text-wall-text-soft">{s.competition_count}</td>
                        <td className="py-2 px-2 text-center text-wall-text-soft">{s.competition_avg_score?.toFixed(1) || '0.0'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-wall-text-muted text-sm text-center py-4">暂无学生数据，请先在"一起练"或"闯关"中记录学号</p>
          )}
        </ScrollPanel>

        {/* Session history */}
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
    </div>
  )
}
