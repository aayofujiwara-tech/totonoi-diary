'use client'

import Link from 'next/link'
import { Flame, ChevronRight, Droplets, Wind } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { getRecentSessions, getWeeklyScores } from '@/lib/mock-data'
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine,
} from 'recharts'

// TODO: Supabase接続 - getRecentSessions をDBクエリに置き換える

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function ScoreChip({ score }: { score: number }) {
  const colors = ['', 'bg-red-800', 'bg-orange-700', 'bg-yellow-700', 'bg-lime-700', 'bg-[#D4853A]']
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white ${colors[score] ?? 'bg-gray-700'}`}>
      ★{score}
    </span>
  )
}

export default function HomePage() {
  const recentSessions = getRecentSessions(5)
  const weeklyScores = getWeeklyScores()

  return (
    <div className="px-4 pt-6 pb-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D4853A]/20 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#D4853A]" />
          </div>
          <h1 className="text-2xl font-bold text-white">ととログ</h1>
        </div>
        <Link href="/record">
          <button className="btn-amber text-sm py-2 px-5">
            サ活を記録
          </button>
        </Link>
      </div>

      {/* 7日間のスコア推移ミニグラフ */}
      <div className="sauna-card mb-5">
        <p className="text-xs text-gray-400 mb-2 font-medium">直近7日間のととのい度</p>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={weeklyScores}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 5]} hide />
            <Tooltip
              contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(v: number) => v === 0 ? ['—', 'ととのい度'] : [`★${v}`, 'ととのい度']}
            />
            <ReferenceLine y={0} stroke="#2E2E2E" />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#D4853A"
              strokeWidth={2}
              dot={{ fill: '#D4853A', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#D4853A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 最近のサ活 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">最近のサ活</h2>
        <Link href="/facilities" className="text-xs text-[#D4853A] flex items-center gap-0.5">
          施設一覧 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentSessions.map(session => (
          <div key={session.id} className="sauna-card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-white text-sm">{session.facility?.name ?? '施設未設定'}</p>
                <p className="text-xs text-gray-400">{formatDate(session.visited_at)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <ScoreChip score={session.totonoil_score} />
                <StarRating value={session.totonoil_score} readonly size="sm" />
              </div>
            </div>

            {/* セット情報 */}
            {session.sets && session.sets.length > 0 && (
              <div className="flex gap-3 text-xs text-gray-400 mb-2">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {session.sets.length}セット
                </span>
                {session.sets[0].sauna_minutes && (
                  <span>{session.sets[0].sauna_minutes}分</span>
                )}
                {session.sets[0].cold_bath_seconds && (
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    {session.sets[0].cold_bath_seconds}秒
                  </span>
                )}
                {session.sets.some(s => s.rest_type === 'outdoor') && (
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-teal-400" />
                    外気浴
                  </span>
                )}
              </div>
            )}

            {session.memo && (
              <p className="text-xs text-gray-400 border-t border-[#2E2E2E] pt-2 line-clamp-1">
                {session.memo}
              </p>
            )}
          </div>
        ))}
      </div>

      {recentSessions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">まだサ活の記録がありません</p>
          <p className="text-xs mt-1">「サ活を記録」から最初の記録を追加しましょう</p>
        </div>
      )}
    </div>
  )
}
