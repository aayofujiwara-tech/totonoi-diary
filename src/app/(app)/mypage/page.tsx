'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Flame, Trophy, Layers, Star, ChevronRight } from 'lucide-react'
import { mockSessions } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/client'

// TODO: Supabase接続 - ユーザー情報・統計をDBから取得する

function calcStats() {
  const totalSessions = mockSessions.length
  const totalSets = mockSessions.reduce((sum, s) => sum + (s.sets?.length ?? 0), 0)
  const avgScore = totalSessions > 0
    ? mockSessions.reduce((sum, s) => sum + s.totonoil_score, 0) / totalSessions
    : 0
  const perfectSessions = mockSessions.filter(s => s.totonoil_score === 5).length
  return { totalSessions, totalSets, avgScore, perfectSessions }
}

export default function MyPage() {
  const router = useRouter()
  const stats = calcStats()

  async function handleLogout() {
    // TODO: Supabase接続 - 実際のログアウト処理
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-white mb-6">マイページ</h1>

      {/* プロフィールカード */}
      <div className="sauna-card mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#D4853A]/20 flex items-center justify-center">
          <Flame className="w-7 h-7 text-[#D4853A]" />
        </div>
        <div>
          <p className="font-bold text-white text-base">サウナー</p>
          {/* TODO: Supabase接続 - ログインユーザーのメールを表示 */}
          <p className="text-xs text-gray-400">デモアカウント</p>
        </div>
      </div>

      {/* 統計グリッド */}
      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">統計</h2>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="sauna-card text-center py-5">
          <div className="flex justify-center mb-1.5">
            <Flame className="w-5 h-5 text-[#D4853A]" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
          <p className="text-xs text-gray-400 mt-1">累計サ活回数</p>
        </div>
        <div className="sauna-card text-center py-5">
          <div className="flex justify-center mb-1.5">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalSets}</p>
          <p className="text-xs text-gray-400 mt-1">総セット数</p>
        </div>
        <div className="sauna-card text-center py-5">
          <div className="flex justify-center mb-1.5">
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.avgScore.toFixed(1)}</p>
          <p className="text-xs text-gray-400 mt-1">平均ととのい度</p>
        </div>
        <div className="sauna-card text-center py-5">
          <div className="flex justify-center mb-1.5">
            <Trophy className="w-5 h-5 text-[#D4853A]" />
          </div>
          <p className="text-3xl font-bold text-white">{stats.perfectSessions}</p>
          <p className="text-xs text-gray-400 mt-1">★5 ととのい回数</p>
        </div>
      </div>

      {/* メニュー */}
      <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">設定</h2>
      <div className="sauna-card mb-5 divide-y divide-[#2E2E2E]">
        <button className="flex items-center justify-between w-full py-3 text-sm text-gray-200 hover:text-white transition-colors">
          <span>通知設定</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
        <button className="flex items-center justify-between w-full py-3 text-sm text-gray-200 hover:text-white transition-colors">
          <span>データエクスポート</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
        <button className="flex items-center justify-between w-full py-3 text-sm text-gray-200 hover:text-white transition-colors">
          <span>プライバシーポリシー</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* ログアウト */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-800/50 text-red-400 text-sm font-semibold hover:bg-red-900/20 active:bg-red-900/30 transition-colors duration-150"
      >
        <LogOut className="w-4 h-4" />
        ログアウト
      </button>

      <p className="text-center text-xs text-gray-600 mt-6">ととログ v0.1</p>
    </div>
  )
}
