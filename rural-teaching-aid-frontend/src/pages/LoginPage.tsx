import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { SealButton } from '../components/ui/SealButton'
import { ScrollPanel } from '../components/ui/BrickCard'
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuthStore()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isRegister) {
      if (!nickname.trim()) {
        setError('请输入昵称')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, nickname)
      if (error) setError(error.message)
      else navigate('/')
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px-88px)] flex items-center justify-center px-4 py-12 wall-texture">
      <div className="w-full max-w-md">
        <ScrollPanel>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-wall-brick border-2 border-wall-gold rounded wall-texture flex items-center justify-center mx-auto mb-4">
              <span className="text-wall-gold-light font-serif font-bold text-2xl">教</span>
            </div>
            <h2 className="text-2xl font-serif text-wall-text tracking-wider">
              {isRegister ? '注册教师账号' : '教师登录'}
            </h2>
            <p className="text-wall-text-muted text-sm mt-2">
              乡村教学辅助平台
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-serif text-wall-text mb-1.5">邮箱</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wall-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-wall-paper border-2 border-wall-border rounded font-sans text-wall-text placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-brick transition-colors"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-serif text-wall-text mb-1.5">昵称</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wall-text-muted" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="请输入您的昵称"
                    required={isRegister}
                    className="w-full pl-10 pr-4 py-2.5 bg-wall-paper border-2 border-wall-border rounded font-sans text-wall-text placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-brick transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-serif text-wall-text mb-1.5">密码</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wall-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-wall-paper border-2 border-wall-border rounded font-sans text-wall-text placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-brick transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wall-text-muted hover:text-wall-text"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-wall-brick/10 border border-wall-brick/30 text-wall-brick-dark px-4 py-2.5 rounded text-sm">
                {error}
              </div>
            )}

            <SealButton
              type="submit"
              variant="solid"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading ? '处理中...' : isRegister ? '注册账号' : '登录'}
            </SealButton>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="text-wall-brick hover:text-wall-brick-dark text-sm font-serif underline underline-offset-4 transition-colors"
            >
              {isRegister ? '已有账号？立即登录' : '没有账号？立即注册'}
            </button>
          </div>
        </ScrollPanel>
      </div>
    </div>
  )
}
