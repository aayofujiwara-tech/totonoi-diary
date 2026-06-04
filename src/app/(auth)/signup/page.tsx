'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/firebase/auth'
import { Flame } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('パスワードが一致しません'); return }
    if (password.length < 8) { setError('パスワードは8文字以上で設定してください'); return }
    setLoading(true)
    setError('')
    try {
      await signUp(email, password)
      setDone(true)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/email-already-in-use') {
        setError('このメールアドレスはすでに使用されています')
      } else if (code === 'auth/weak-password') {
        setError('パスワードが弱すぎます。6文字以上にしてください')
      } else {
        setError('登録に失敗しました。しばらくしてから再試行してください')
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl">✉️</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">登録完了！</h2>
        <p className="text-gray-400 text-sm mb-6">
          {email} でアカウントが作成されました。
        </p>
        <button
          className="btn-amber"
          onClick={() => router.push('/home')}
        >
          ホームへ進む
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-[#D4853A]/20 rounded-2xl flex items-center justify-center mb-4">
          <Flame className="w-8 h-8 text-[#D4853A]" />
        </div>
        <h1 className="text-2xl font-bold text-white">新規登録</h1>
        <p className="text-gray-400 text-sm mt-1">ととのいを記録しよう</p>
      </div>

      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
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
          <label className="label-text">パスワード（8文字以上）</label>
          <input
            type="password"
            className="input-dark"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-text">パスワード（確認）</label>
          <input
            type="password"
            className="input-dark"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" className="btn-amber w-full" disabled={loading}>
          {loading ? '登録中...' : '登録する'}
        </button>
      </form>

      <p className="mt-6 text-gray-400 text-sm">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-[#D4853A] hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
