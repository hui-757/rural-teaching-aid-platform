import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Teacher } from '../types'

interface AuthState {
  user: Teacher | null
  session: unknown | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, nickname: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }
    if (data.user) {
      const { data: teacherData } = await supabase
        .from('teacher')
        .select('*')
        .eq('id', data.user.id)
        .single()
      set({ user: teacherData as Teacher, session: data.session })
    }
    return { error: null }
  },

  signUp: async (email, password, nickname) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }
    if (data.user) {
      await supabase.from('teacher').insert({ id: data.user.id, nickname })
      set({ user: { id: data.user.id, nickname, created_at: new Date().toISOString() }, session: data.session })
    }
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  fetchUser: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: teacherData } = await supabase
        .from('teacher')
        .select('*')
        .eq('id', session.user.id)
        .single()
      set({ user: teacherData as Teacher, session, loading: false })
    } else {
      set({ loading: false })
    }
  },
}))
