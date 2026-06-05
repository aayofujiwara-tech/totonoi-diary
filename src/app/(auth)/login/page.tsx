'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, signInWithGoogle } from '@/lib/firebase/auth'
import { useAuth } from '@/hooks/useAuth'
import { useGuest } from '@/contexts/GuestContext'
import { Flame } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { isGuest, activateGuest } = useGuest()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (isGuest) { router.replace('/home'); return }
    if (!authLoading && user) router.replace('/home')
  }, [user, authLoading, isGuest, router])

  if (isGuest || authLoading || user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-10 h-10 bg-[#D4853A]/20 rounded-xl flex items-center justify-center animate-pulse">
          <Flame className="w-5 h-5 text-[#D4853A]" />
        </div>
      </div>
    )
  }

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

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      router.push('/home')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('Googleログインに失敗しました。再試行してください')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  function handleGuestMode() {
    activateGuest()
    router.push('/home')
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

      {/* Googleログイン */}
      <div className="w-full max-w-sm mb-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 disabled:opacity-50"
        >
          <GoogleIcon />
          {googleLoading ? '接続中...' : 'Googleでログイン'}
        </button>
      </div>

      {/* 区切り */}
      <div className="w-full max-w-sm flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#2E2E2E]" />
        <span className="text-xs text-gray-500">またはメールで</span>
        <div className="flex-1 h-px bg-[#2E2E2E]" />
      </div>

      {/* メール/パスワード */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <label className="label-text">メールアドレス</label>
          <input type="email" className="input-dark" placeholder="sauna@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label-text">パスワード</label>
          <input type="password" className="input-dark" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" className="btn-amber w-full" disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      {/* ゲストモード区切り */}
      <div className="w-full max-w-sm flex items-center gap-3 mt-6 mb-4">
        <div className="flex-1 h-px bg-[#2E2E2E]" />
        <span className="text-xs text-gray-500">または</span>
        <div className="flex-1 h-px bg-[#2E2E2E]" />
      </div>

      {/* ゲストとして試す */}
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={handleGuestMode}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-[#D4853A]/40 text-[#D4853A] text-sm font-semibold hover:bg-[#D4853A]/10 active:bg-[#D4853A]/20 transition-colors duration-150"
        >
          <Flame className="w-4 h-4" />
          ゲストとして試す
        </button>
        <p className="text-center text-xs text-gray-600 mt-2">
          登録不要・データはこの端末にのみ保存されます
        </p>
      </div>

      <p className="mt-6 text-gray-400 text-sm">
        アカウントをお持ちでない方は{' '}
        <Link href="/signup" className="text-[#D4853A] hover:underline">新規登録</Link>
      </p>
    </div>
  )
}
