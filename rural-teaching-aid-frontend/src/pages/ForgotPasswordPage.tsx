import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { SealButton } from '../components/ui/SealButton'
import { ScrollPanel } from '../components/ui/BrickCard'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword } = useAuthStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await resetPassword(email)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
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
            <h2 className="text-2xl font-serif text-wall-text tracking-wider">重置密码</h2>
            <p className="text-wall-text-muted text-sm mt-2">
              输入注册邮箱，我们将发送重置链接
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="text-green-600 mx-auto" />
              <p className="text-wall-text font-serif">邮件已发送</p>
              <p className="text-wall-text-muted text-sm">
                请检查邮箱（包括垃圾邮件箱），点击邮件中的链接重置密码。
              </p>
              <SealButton variant="outline" onClick={() => navigate('/login')}>
                <ArrowLeft size={14} className="mr-1" /> 返回登录
              </SealButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-serif text-wall-text mb-1.5">邮箱</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wall-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入注册邮箱"
                    required
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
                {loading ? '发送中...' : '发送重置链接'}
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
