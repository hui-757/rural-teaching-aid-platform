export interface Teacher {
  id: string
  nickname: string
  grade_selected: string | null
  created_at: string
}

export interface Unit {
  unit_id: number
  unit_name: string
  unit_desc: string | null
  grade: string
  has_test: boolean | null
  created_at: string
}

export interface VerticalLineItem {
  type: 'text' | 'blank'
  text?: string
  id?: string
  answer?: string
}

export interface VerticalContent {
  lines: VerticalLineItem[][]
}

export interface Question {
  question_id: number
  unit_id: number
  content: string
  answer: string
  type: string | null
  difficulty: number | null
  raw_content: VerticalContent | null
  created_at: string
}

export interface CalcQuestion {
  id: number
  category: string
  grade: string
  content: string
  raw_content: VerticalContent | null
  answer: string
  answer_remainder: string | null
  type: string
  created_at: string
}

export interface GameRecord {
  record_id: number
  teacher_id: string
  student_name: string
  unit_id: number | null
  category: string | null
  score: number | null
  level: number | null
  answers_json: AnswerItem[]
  created_at: string
}

export interface AnswerItem {
  question_id: number
  student_answer: string
  correct: boolean
}

export interface TestAnswer {
  answer_id: number
  teacher_id: string
  unit_id: number
  test_no: number
  answers_json: Record<string, string>
  created_at: string
}

export interface GameState {
  category: string | null
  currentLevel: number
  totalLevels: number
  questions: CalcQuestion[]
  answers: AnswerItem[]
  startTime: number
  studentName: string
  isActive: boolean
}
export interface LevelConfig {
  timeLimit: number
  targetAccuracy: number
  consecutiveRequired: number
  questionCount: number
}
