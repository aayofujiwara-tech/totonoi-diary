'use client'

import dynamic from 'next/dynamic'
import { Sparkles } from 'lucide-react'
import { mockSessions } from '@/lib/mock-data'

// TODO: Supabase接続 - 分析データをDBから取得する

// Rechartsはクライアントのみのためdynamic importでSSRを無効化
const ScoreLineChart = dynamic(() => import('@/components/dashboard/ScoreLineChart'), { ssr: false })
const FacilityBarChart = dynamic(() => import('@/components/dashboard/FacilityBarChart'), { ssr: false })
const { ColdBathScatter, SleepScatter } = {
  ColdBathScatter: dynamic(() => import('@/components/dashboard/ScatterCharts').then(m => m.ColdBathScatter), { ssr: false }),
  SleepScatter: dynamic(() => import('@/components/dashboard/ScatterCharts').then(m => m.SleepScatter), { ssr: false }),
}

function calcBestConditions() {
  const highScoreSessions = mockSessions.filter(s => s.totonoil_score >= 4)
  if (highScoreSessions.length === 0) return null

  const avgCold = highScoreSessions
    .flatMap(s => s.sets ?? [])
    .filter(set => set.cold_bath_seconds != null)
    .reduce((sum, set, _, arr) => sum + set.cold_bath_seconds! / arr.length, 0)

  const avgSleep = highScoreSessions
    .filter(s => s.condition?.sleep_hours != null)
    .reduce((sum, s, _, arr) => sum + s.condition!.sleep_hours! / arr.length, 0)

  const loylyCount = highScoreSessions.filter(s => s.sets?.some(set => set.loyly)).length
  const loylyRate = Math.round((loylyCount / highScoreSessions.length) * 100)

  const outdoorCount = highScoreSessions.filter(s => s.sets?.some(set => set.rest_type === 'outdoor')).length
  const outdoorRate = Math.round((outdoorCount / highScoreSessions.length) * 100)

  const overallAvg = mockSessions.reduce((sum, s) => sum + s.totonoil_score, 0) / mockSessions.length
  const highAvg = highScoreSessions.reduce((sum, s) => sum + s.totonoil_score, 0) / highScoreSessions.length

  return { avgCold, avgSleep, loylyRate, outdoorRate, overallAvg, highAvg, count: highScoreSessions.length }
}

export default function DashboardPage() {
  const best = calcBestConditions()
  const totalSessions = mockSessions.length

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-white mb-5">分析ダッシュボード</h1>

      {totalSessions < 3 && (
        <div className="sauna-card mb-5 text-center text-sm text-gray-400">
          <p>記録が3件以上になると詳しい分析が表示されます</p>
        </div>
      )}

      {/* ベスト条件 */}
      {best && (
        <div className="bg-gradient-to-br from-[#2A1A0A] to-[#1E1E1E] border border-[#D4853A]/30 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#D4853A]" />
            <h2 className="text-sm font-bold text-[#D4853A]">あなたのベスト条件</h2>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            スコア{best.count}件のデータから分析：
            <br />
            <span className="text-white font-semibold">水風呂 {Math.round(best.avgCold)}秒前後</span>、
            <span className="text-white font-semibold">睡眠 {best.avgSleep.toFixed(1)}h以上</span>
            {best.loylyRate >= 50 && <>、<span className="text-white font-semibold">löylyあり</span></>}
            {best.outdoorRate >= 50 && <>、<span className="text-white font-semibold">外気浴あり</span></>}
            の日は平均ととのい度が
            <span className="text-[#D4853A] font-bold text-base"> ★{best.highAvg.toFixed(1)} </span>
            になっています。（全体平均 ★{best.overallAvg.toFixed(1)}）
          </p>
        </div>
      )}

      {/* ととのい度の推移 */}
      <div className="sauna-card mb-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">ととのい度の推移</h2>
        <ScoreLineChart />
      </div>

      {/* ととのい度 × 水風呂時間 */}
      <div className="sauna-card mb-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-1">ととのい度 × 水風呂時間</h2>
        <p className="text-xs text-gray-500 mb-3">最適な水風呂時間を発見しよう</p>
        <ColdBathScatter />
      </div>

      {/* ととのい度 × 睡眠時間 */}
      <div className="sauna-card mb-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-1">ととのい度 × 睡眠時間</h2>
        <p className="text-xs text-gray-500 mb-3">コンディションとの相関を確認</p>
        <SleepScatter />
      </div>

      {/* 施設別平均 */}
      <div className="sauna-card mb-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">施設別 平均ととのい度</h2>
        <FacilityBarChart />
      </div>
    </div>
  )
}
