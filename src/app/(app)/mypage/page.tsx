'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Flame, Trophy, Layers, Star, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getUserStats } from '@/lib/firebase/db'
import { signOut } from '@/lib/firebase/auth'

type Stats = { totalSessions: number; totalSets: number; avgScore: number; perfectSessions: number }

export default function MyPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Stats>({ totalSessions: 0, totalSets: 0, avgScore: 0, perfectSessions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    getUserStats(user.uid)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  async function handleLogout() {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-white mb-6">マイページ</h1>

      {/* プロフィール */}
      <div className="sauna-card mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#D4853A]/20 flex items-center justify-center">
          <Flame className="w-7 h-7 text-[#D4853A]" />
        </div>
        <div>
          <p className="font-bold text-white text-base">サウナー</p>
          <p className="text-xs text-gray-400">{user?.email ?? '—'}</p>
        </div>
      </div>

      {/* 統計グリッド */}
      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">統計</h2>
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

      {/* 設定メニュー */}
      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">設定</h2>
      <div className="sauna-card mb-5 divide-y divide-[#2E2E2E]">
        {['通知設定', 'データエクスポート', 'プライバシーポリシー'].map(label => (
          <button key={label} className="flex items-center justify-between w-full py-3 text-sm text-gray-200 hover:text-white transition-colors">
            <span>{label}</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        ))}
      </div>

      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-800/50 text-red-400 text-sm font-semibold hover:bg-red-900/20 active:bg-red-900/30 transition-colors duration-150">
        <LogOut className="w-4 h-4" />ログアウト
      </button>

      <p className="text-center text-xs text-gray-600 mt-6">ととログ v0.1</p>
    </div>
  )
}
