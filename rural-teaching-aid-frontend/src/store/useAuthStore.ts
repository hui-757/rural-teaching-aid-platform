import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Teacher } from '../types'

interface AuthState {
  user: Teacher | null
  session: unknown | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, nickname: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

async function fetchTeacherData(userId: string) {
  const { data, error } = await supabase
    .from('teacher')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as Teacher
}

export const useAuthStore = create<AuthState>((set) => {
  // 初始化时立即尝试恢复 session
  supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
    if (sessionError) {
      console.warn('[Auth] getSession error:', sessionError.message)
    }

    if (session?.user) {
      const teacher = await fetchTeacherData(session.user.id)
      if (teacher) {
        console.log('[Auth] Session restored for', teacher.nickname)
        set({ user: teacher, session, loading: false, initialized: true })
        return
      }
    }

    // 兜底：尝试用 getUser 验证 JWT 是否仍有效
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.warn('[Auth] getUser error:', userError.message)
    }
    if (authUser) {
      const teacher = await fetchTeacherData(authUser.id)
      if (teacher) {
        console.log('[Auth] User validated via getUser for', teacher.nickname)
        set({ user: teacher, session: null, loading: false, initialized: true })
        return
      }
    }

    console.log('[Auth] No valid session found')
    set({ loading: false, initialized: true })
  })

  // 监听 auth 状态变化
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[Auth] onAuthStateChange event:', event)
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      if (session?.user) {
        const teacher = await fetchTeacherData(session.user.id)
        set({ user: teacher, session })
      }
    } else if (event === 'SIGNED_OUT') {
      set({ user: null, session: null })
    } else if (event === 'TOKEN_REFRESHED') {
      if (session?.user) {
        set({ session })
      }
    }
  })

  // 页面卸载时取消订阅（HMR 场景下避免重复监听）
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => subscription.unsubscribe())
  }

  return {
    user: null,
    session: null,
    loading: true,
    initialized: false,

    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error }
      if (data.user) {
        const teacher = await fetchTeacherData(data.user.id)
        set({ user: teacher, session: data.session, loading: false, initialized: true })
      }
      return { error: null }
    },

    signUp: async (email, password, nickname) => {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { error }
      if (data.user) {
        await supabase.from('teacher').insert({ id: data.user.id, nickname })
        set({ user: { id: data.user.id, nickname, grade_selected: null, created_at: new Date().toISOString() }, session: data.session })
      }
      return { error: null }
    },

    signOut: async () => {
      await supabase.auth.signOut()
      set({ user: null, session: null, loading: false, initialized: true })
    },
  }
})
