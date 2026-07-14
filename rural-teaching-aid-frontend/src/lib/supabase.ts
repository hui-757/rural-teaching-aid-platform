import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type Database = {
  public: {
    Tables: {
      teacher: {
        Row: {
          id: string
          nickname: string
          grade_selected: string | null
          created_at: string
        }
      }
      unit: {
        Row: {
          unit_id: number
          unit_name: string
          unit_desc: string | null
          grade: string
          has_test: boolean | null
          created_at: string
        }
      }
      calc_question: {
        Row: {
          id: number
          category: string
          grade: string
          content: string
          raw_content: unknown
          answer: string
          answer_remainder: string | null
          type: string
          created_at: string
        }
      }
      record: {
        Row: {
          record_id: number
          teacher_id: string
          student_name: string
          unit_id: number | null
          category: string | null
          grade: string | null
          level: number | null
          score: number | null
          answers_json: unknown
          note: string | null
          created_at: string
        }
      }
      practice_session: {
        Row: {
          id: string
          teacher_id: string
          unit_id: number
          session_label: string
          created_at: string
        }
      }
      practice_answer: {
        Row: {
          id: string
          session_id: string
          student_number: string
          question_id: number
          is_correct: boolean
          answered_at: string
        }
      }
      student_stats: {
        Row: {
          id: string
          teacher_id: string
          student_number: string
          practice_sessions: number
          practice_questions: number
          practice_correct: number
          competition_count: number
          competition_avg_score: number
        }
      }
      test_answer: {
        Row: {
          answer_id: number
          teacher_id: string
          unit_id: number
          test_no: number
          answers_json: unknown
          created_at: string
        }
      }
      note: {
        Row: {
          note_id: number
          record_id: number
          content: string
          created_at: string
        }
      }
    }
  }
}
