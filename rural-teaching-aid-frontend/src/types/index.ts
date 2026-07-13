export interface Teacher {
  id: string
  nickname: string
  created_at: string
}

export interface Unit {
  id: number
  grade: number
  unit_number: number
  title: string
  description: string
  has_calculations: boolean
  created_at: string
}

export interface Question {
  id: number
  unit_id: number
  type: string
  content: string
  answer: string
  difficulty: number
  created_at: string
}

export interface GameRecord {
  id: number
  teacher_id: string
  student_name: string
  unit_id: number
  level: number
  score: number
  answers_json: AnswerItem[]
  note: string
  created_at: string
}

export interface AnswerItem {
  question_id: number
  student_answer: string
  correct: boolean
}

export interface TestAnswer {
  id: number
  teacher_id: string
  unit_id: number
  test_number: number
  answers_json: Record<string, string>
  created_at: string
}

export interface GameState {
  unitId: number | null
  currentLevel: number
  totalLevels: number
  questions: Question[]
  answers: AnswerItem[]
  startTime: number
  studentName: string
  isActive: boolean
}

export interface LevelConfig {
  timeLimit: number // seconds
  targetAccuracy: number // 0-1
  consecutiveRequired: number
  questionCount: number
}
