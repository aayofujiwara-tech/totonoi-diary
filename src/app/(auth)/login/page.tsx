'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/firebase/auth'
import { Flame } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      router.push('/home')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('メールアドレスかパスワードが正しくありません')
      } else if (code === 'auth/too-many-requests') {
        setError('試行回数が多すぎます。しばらくしてから再試行してください')
      } else {
        setError('ログインに失敗しました。しばらくしてから再試行してください')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-[#D4853A]/20 rounded-2xl flex items-center justify-center mb-4">
          <Flame className="w-8 h-8 text-[#D4853A]" />
        </div>
        <h1 className="text-3xl font-bold text-white">ととログ</h1>
        <p className="text-gray-400 text-sm mt-1">サウナととのい最適化アプリ</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <label className="label-text">メールアドレス</label>
          <input
            type="email"
            className="input-dark"
            placeholder="sauna@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-text">パスワード</label>
          <input
            type="password"
            className="input-dark"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" className="btn-amber w-full" disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <p className="mt-6 text-gray-400 text-sm">
        アカウントをお持ちでない方は{' '}
        <Link href="/signup" className="text-[#D4853A] hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  )
}
