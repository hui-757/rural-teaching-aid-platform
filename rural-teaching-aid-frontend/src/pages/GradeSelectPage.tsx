import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { GreatWallDivider } from '../components/ui/BrickCard'
import { GoldBadge } from '../components/ui/SealButton'
import { GraduationCap, ArrowRight } from 'lucide-react'

const GRADES = [
  { value: 1, label: '一年级', desc: '数学启蒙' },
  { value: 2, label: '二年级', desc: '基础运算' },
  { value: 3, label: '三年级', desc: '进阶计算' },
  { value: 4, label: '四年级', desc: '当前主推' },
  { value: 5, label: '五年级', desc: '综合应用' },
  { value: 6, label: '六年级', desc: '小升初' },
]

export default function GradeSelectPage() {
  const navigate = useNavigate()
  const { setGrade } = useAppStore()

  const handleSelect = (grade: number) => {
    setGrade(grade)
    navigate('/')
  }

  return (
    <div className="min-h-[calc(100vh-64px-88px)] flex flex-col items-center justify-center px-4 py-12 wall-texture">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-wall-brick border-2 border-wall-gold rounded wall-texture flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={28} className="text-wall-gold-light" />
        </div>
        <h1 className="text-3xl font-serif text-wall-text mb-2 tracking-widest">
          选择年级
        </h1>
        <GreatWallDivider className="max-w-xs mx-auto" />
        <p className="text-wall-text-muted mt-3">
          请选择您当前教授的年级，后续可在首页随时切换
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 max-w-2xl w-full">
        {GRADES.map((grade) => (
          <button
            key={grade.value}
            onClick={() => handleSelect(grade.value)}
            className="group relative bg-wall-paper border-2 border-wall-border rounded-lg p-6 brick-pattern hover:border-wall-brick hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-wall-brick/0 group-hover:bg-wall-brick transition-colors" />
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif text-2xl font-bold text-wall-text">{grade.label}</span>
              <ArrowRight
                size={18}
                className="text-wall-text-muted group-hover:text-wall-brick transition-colors"
              />
            </div>
            <p className="text-wall-text-muted text-sm">{grade.desc}</p>
            {grade.value === 4 && (
              <GoldBadge className="absolute top-3 right-3 text-xs">当前开放</GoldBadge>
            )}
          </button>
        ))}
      </div>

      <p className="text-wall-text-muted/60 text-sm mt-8 text-center">
        目前仅四年级题库完善，其他年级正在建设中
      </p>
    </div>
  )
}
