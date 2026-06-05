'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Flame, Trophy, Layers, Star, ChevronRight, UserPlus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGuest } from '@/contexts/GuestContext'
import { getUserStats } from '@/lib/firebase/db'
import { guestGetUserStats } from '@/lib/guest/storage'
import { signOut } from '@/lib/firebase/auth'

type Stats = { totalSessions: number; totalSets: number; avgScore: number; perfectSessions: number }

export default function MyPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { isGuest, deactivateGuest } = useGuest()
  const [stats, setStats] = useState<Stats>({ totalSessions: 0, totalSets: 0, avgScore: 0, perfectSessions: 0 })
  const [loading, setLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)

  useEffect(() => {
    if (isGuest) {
      guestGetUserStats().then(setStats).finally(() => setLoading(false))
      return
    }
    if (authLoading) return
    if (!user) { setLoading(false); return }
    getUserStats(user.uid)
      .then(setStats)
      .catch(() => setStatsError(true))
      .finally(() => setLoading(false))
  }, [user, authLoading, isGuest])

  async function handleLogout() {
    if (isGuest) {
      deactivateGuest()
      router.push('/login')
      return
    }
    await signOut()
    router.push('/login')
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-white mb-6">マイページ</h1>

      {/* ゲストモードCTA */}
      {isGuest && (
        <Link href="/signup">
          <div className="mb-5 flex items-center gap-3 bg-gradient-to-r from-[#2A1A0A] to-[#1E1A14] border border-[#D4853A]/40 rounded-2xl px-4 py-4 hover:border-[#D4853A]/70 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#D4853A]/20 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5 text-[#D4853A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#D4853A]">アカウント登録してデータを引き継ぐ</p>
              <p className="text-xs text-gray-400 mt-0.5">複数端末で同期・データを永続保存</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D4853A] flex-shrink-0" />
          </div>
        </Link>
      )}

      {/* プロフィール */}
      <div className="sauna-card mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#D4853A]/20 flex items-center justify-center">
          <Flame className="w-7 h-7 text-[#D4853A]" />
        </div>
        <div>
          <p className="font-bold text-white text-base">サウナー</p>
          {isGuest
            ? <p className="text-xs text-[#D4853A] font-medium">ゲストモード</p>
            : <p className="text-xs text-gray-400">{user?.email ?? '—'}</p>
          }
        </div>
      </div>

      {/* 統計グリッド */}
      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">統計</h2>
      {statsError && (
        <p className="text-xs text-red-400 bg-red-400/10 rounded-xl px-3 py-2 mb-3">統計の取得に失敗しました</p>
      )}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: <Flame className="w-5 h-5 text-[#D4853A]" />, value: loading ? '…' : stats.totalSessions, label: '累計サ活回数' },
          { icon: <Layers className="w-5 h-5 text-blue-400" />, value: loading ? '…' : stats.totalSets, label: '総セット数' },
          { icon: <Star className="w-5 h-5 text-yellow-400" />, value: loading ? '…' : stats.avgScore.toFixed(1), label: '平均ととのい度' },
          { icon: <Trophy className="w-5 h-5 text-[#D4853A]" />, value: loading ? '…' : stats.perfectSessions, label: '★5 ととのい回数' },
        ].map((item, i) => (
          <div key={i} className="sauna-card text-center py-5">
            <div className="flex justify-center mb-1.5">{item.icon}</div>
            <p className="text-3xl font-bold text-white">{item.value}</p>
            <p className="text-xs text-gray-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ゲスト：端末保存の注意書き */}
      {isGuest && (
        <div className="sauna-card mb-5 border-[#D4853A]/20">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-[#D4853A] font-semibold">ゲストモードのデータについて</span><br />
            現在のデータはこの端末のブラウザにのみ保存されています。
            アカウント登録するとクラウドに保存され、複数端末で利用できます。
          </p>
        </div>
      )}

      {/* 設定メニュー（非ゲスト） */}
      {!isGuest && (
        <>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">設定</h2>
          <div className="sauna-card mb-5 divide-y divide-[#2E2E2E]">
            {['通知設定', 'データエクスポート', 'プライバシーポリシー'].map(label => (
              <button key={label} className="flex items-center justify-between w-full py-3 text-sm text-gray-200 hover:text-white transition-colors">
                <span>{label}</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            ))}
          </div>
        </>
      )}

      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-800/50 text-red-400 text-sm font-semibold hover:bg-red-900/20 active:bg-red-900/30 transition-colors duration-150">
        <LogOut className="w-4 h-4" />
        {isGuest ? 'ゲストモードを終了' : 'ログアウト'}
      </button>

      <p className="text-center text-xs text-gray-600 mt-6">ととログ v0.1</p>
    </div>
  )
}
