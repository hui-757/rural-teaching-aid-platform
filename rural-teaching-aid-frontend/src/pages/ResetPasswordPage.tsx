import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { SealButton } from '../components/ui/SealButton'
import { ScrollPanel } from '../components/ui/BrickCard'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // 检查 URL 中是否有 access_token（来自邮件链接）
    const hash = window.location.hash
    if (!hash.includes('access_token') && !hash.includes('type=recovery')) {
      // 如果没有 token，可能是直接访问，不做处理
      // 实际重置时 Supabase 会自动从 hash 中解析 token
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('密码长度至少为 6 位')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
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
            <h2 className="text-2xl font-serif text-wall-text tracking-wider">设置新密码</h2>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="text-green-600 mx-auto" />
              <p className="text-wall-text font-serif">密码已重置</p>
              <p className="text-wall-text-muted text-sm">
                请使用新密码重新登录。
              </p>
              <SealButton variant="solid" onClick={() => navigate('/login')}>
                前往登录
              </SealButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-serif text-wall-text mb-1.5">新密码</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wall-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入新密码（至少6位）"
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

              <div>
                <label className="block text-sm font-serif text-wall-text mb-1.5">确认密码</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wall-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-wall-paper border-2 border-wall-border rounded font-sans text-wall-text placeholder:text-wall-text-muted/50 focus:outline-none focus:border-wall-brick transition-colors"
                  />
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
                {loading ? '处理中...' : '确认重置'}
              </SealButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-wall-brick hover:text-wall-brick-dark text-sm font-serif underline underline-offset-4 transition-colors"
                >
                  <ArrowLeft size={14} className="inline mr-1" /> 返回登录
                </button>
              </div>
            </form>
          )}
        </ScrollPanel>
      </div>
    </div>
  )
}
