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
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
}

async function fetchTeacherData(userId: string): Promise<Teacher | null> {
  const { data, error } = await supabase
    .from('teacher')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) {
    console.warn('[Auth] fetchTeacherData error:', error.message)
  }
  if (error || !data) return null
  return data as Teacher
}

async function ensureTeacherRecord(userId: string, nickname?: string): Promise<Teacher | null> {
  // 先查
  let teacher = await fetchTeacherData(userId)
  if (teacher) return teacher

  // 查不到则自动创建兜底记录（从 auth 用户 metadata 取昵称，或生成默认昵称）
  console.log('[Auth] Teacher record not found, creating fallback for', userId)
  const fallbackNickname = nickname || '教师' + userId.slice(0, 6)
  const { error: insertError } = await supabase
    .from('teacher')
    .insert({ id: userId, nickname: fallbackNickname })

  if (insertError) {
    console.error('[Auth] Failed to create teacher record:', insertError.message)
    return null
  }

  return fetchTeacherData(userId)
}

export const useAuthStore = create<AuthState>((set) => {
  // 初始化时立即尝试恢复 session
  supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
    if (sessionError) {
      console.warn('[Auth] getSession error:', sessionError.message)
    }

    if (session?.user) {
      const teacher = await ensureTeacherRecord(session.user.id)
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
      const teacher = await ensureTeacherRecord(authUser.id)
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
        const teacher = await ensureTeacherRecord(session.user.id)
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
        const teacher = await ensureTeacherRecord(data.user.id)
        console.log('[Auth] signIn result, user=', teacher?.nickname ?? 'null')
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

    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    },

    updatePassword: async (password) => {
      const { error } = await supabase.auth.updateUser({ password })
      return { error }
    },
  }
})
