'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getAllSessionsForDashboard } from '@/lib/firebase/db'
import type { Session, SetData, Condition, Facility } from '@/lib/types'

const ScoreLineChart = dynamic(() => import('@/components/dashboard/ScoreLineChart'), { ssr: false })
const FacilityBarChart = dynamic(() => import('@/components/dashboard/FacilityBarChart'), { ssr: false })
const ColdBathScatter = dynamic(
  () => import('@/components/dashboard/ScatterCharts').then(m => ({ default: m.ColdBathScatter })),
  { ssr: false }
)
const SleepScatter = dynamic(
  () => import('@/components/dashboard/ScatterCharts').then(m => ({ default: m.SleepScatter })),
  { ssr: false }
)

type DashData = { sessions: Session[]; sets: SetData[]; conditions: Condition[]; facilities: Facility[] }

function calcBestConditions(data: DashData) {
  const high = data.sessions.filter(s => s.totonoilScore >= 4)
  if (high.length < 2) return null

  const highSets = data.sets.filter(s => high.some(h => h.id === s.sessionId))
  const coldSets = highSets.filter(s => s.coldBathSeconds != null && s.coldBathSeconds > 0)
  const avgCold = coldSets.length > 0
    ? coldSets.reduce((sum, s) => sum + s.coldBathSeconds!, 0) / coldSets.length
    : 0

  const highConds = data.conditions.filter(c => high.some(h => h.id === c.sessionId))
  const sleepConds = highConds.filter(c => c.sleepHours != null)
  const avgSleep = sleepConds.length > 0
    ? sleepConds.reduce((sum, c) => sum + c.sleepHours!, 0) / sleepConds.length
    : 0

  const loylyRate = high.length > 0
    ? Math.round(high.filter(s => highSets.filter(x => x.sessionId === s.id).some(x => x.loyly)).length / high.length * 100)
    : 0
  const outdoorRate = high.length > 0
    ? Math.round(high.filter(s => highSets.filter(x => x.sessionId === s.id).some(x => x.restType === 'outdoor')).length / high.length * 100)
    : 0

  const overallAvg = data.sessions.reduce((s, x) => s + x.totonoilScore, 0) / data.sessions.length
  const highAvg = high.reduce((s, x) => s + x.totonoilScore, 0) / high.length

  return { avgCold, avgSleep, loylyRate, outdoorRate, overallAvg, highAvg, count: high.length }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    if (!user) return
    getAllSessionsForDashboard(user.uid)
      .then(setData)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [user])

  const best = data ? calcBestConditions(data) : null
  const hasEnough = (data?.sessions.length ?? 0) >= 3

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-white mb-5">分析ダッシュボード</h1>

      {loading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sauna-card animate-pulse h-52" />
          ))}
        </div>
      )}

      {!loading && fetchError && (
        <div className="sauna-card text-center py-10 text-red-400">
          <p className="text-sm">データの取得に失敗しました</p>
          <p className="text-xs text-gray-500 mt-1">通信環境を確認して再読み込みしてください</p>
        </div>
      )}

      {!loading && !fetchError && !hasEnough && (
        <div className="sauna-card text-center py-14 text-gray-500">
          <p className="text-3xl mb-4">📊</p>
          <p className="text-sm font-medium text-gray-300 mb-1">データが不足しています</p>
          <p className="text-xs">記録が3件以上になると分析が表示されます</p>
          <p className="text-xs mt-1">現在: {data?.sessions.length ?? 0}件</p>
        </div>
      )}

      {!loading && !fetchError && hasEnough && data && (
        <>
          {/* ベスト条件（フル幅） */}
          {best && (
            <div className="bg-gradient-to-br from-[#2A1A0A] to-[#1E1E1E] border border-[#D4853A]/30 rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#D4853A]" />
                <h2 className="text-sm font-bold text-[#D4853A]">あなたのベスト条件</h2>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                スコア4以上の{best.count}件から分析：
                <br />
                {best.avgCold > 0 && (
                  <><span className="text-white font-semibold">水風呂 {Math.round(best.avgCold)}秒前後</span>、</>
                )}
                {best.avgSleep > 0 && (
                  <><span className="text-white font-semibold">睡眠 {best.avgSleep.toFixed(1)}h以上</span></>
                )}
                {best.loylyRate >= 50 && (
                  <>、<span className="text-white font-semibold">löylyあり</span></>
                )}
                {best.outdoorRate >= 50 && (
                  <>、<span className="text-white font-semibold">外気浴あり</span></>
                )}
                の日は平均ととのい度が
                <span className="text-[#D4853A] font-bold text-base"> ★{best.highAvg.toFixed(1)} </span>
                （全体平均 ★{best.overallAvg.toFixed(1)}）
              </p>
            </div>
          )}

          {/* ととのい度の推移（フル幅） */}
          <div className="sauna-card mb-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">ととのい度の推移</h2>
            <ScoreLineChart sessions={data.sessions} />
          </div>

          {/* 散布図 + 棒グラフ を2カラムグリッドで */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="sauna-card">
              <h2 className="text-sm font-semibold text-gray-300 mb-1">ととのい度 × 水風呂時間</h2>
              <p className="text-xs text-gray-500 mb-3">最適な水風呂時間を発見しよう</p>
              <ColdBathScatter sessions={data.sessions} sets={data.sets} />
            </div>

            <div className="sauna-card">
              <h2 className="text-sm font-semibold text-gray-300 mb-1">ととのい度 × 睡眠時間</h2>
              <p className="text-xs text-gray-500 mb-3">コンディションとの相関を確認</p>
              <SleepScatter sessions={data.sessions} conditions={data.conditions} />
            </div>

            <div className="sauna-card md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">施設別 平均ととのい度</h2>
              <FacilityBarChart facilities={data.facilities} sessions={data.sessions} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
