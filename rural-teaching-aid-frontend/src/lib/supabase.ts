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
          created_at: string
        }
      }
      unit: {
        Row: {
          id: number
          grade: number
          unit_number: number
          title: string
          description: string
          has_calculations: boolean
          created_at: string
        }
      }
      question: {
        Row: {
          id: number
          unit_id: number
          type: string
          content: string
          answer: string
          difficulty: number
          created_at: string
        }
      }
      record: {
        Row: {
          id: number
          teacher_id: string
          student_name: string
          unit_id: number
          level: number
          score: number
          answers_json: unknown
          note: string
          created_at: string
        }
      }
      test_answer: {
        Row: {
          id: number
          teacher_id: string
          unit_id: number
          test_number: number
          answers_json: unknown
          created_at: string
        }
      }
      announcement: {
        Row: {
          id: number
          content: string
          created_at: string
        }
      }
    }
  }
}
