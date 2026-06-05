'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame, ChevronRight, Droplets, Wind } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { useAuth } from '@/hooks/useAuth'
import { useGuest } from '@/contexts/GuestContext'
import { getRecentSessions } from '@/lib/firebase/db'
import { guestGetRecentSessions } from '@/lib/guest/storage'
import type { Session } from '@/lib/types'
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine,
} from 'recharts'

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function buildWeeklyData(sessions: Session[]) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const hit = sessions.find(s => s.visitedAt.startsWith(dateStr))
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, score: hit?.totonoilScore ?? 0 }
  })
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
  const { user, loading: authLoading } = useAuth()
  const { isGuest } = useGuest()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isGuest) {
      guestGetRecentSessions(10).then(setSessions).finally(() => setLoading(false))
      return
    }
    if (authLoading) return
    if (!user) { setLoading(false); return }
    getRecentSessions(user.uid, 10)
      .then(setSessions)
      .catch((err) => {
        console.error('[home] getRecentSessions failed:', err)
        setError('データの取得に失敗しました')
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, isGuest])

  const recentFive = sessions.slice(0, 5)
  const weeklyScores = buildWeeklyData(sessions)

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D4853A]/20 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#D4853A]" />
          </div>
          <h1 className="text-2xl font-bold text-white">ととログ</h1>
        </div>
        <Link href="/record">
          <button className="btn-amber text-sm py-2 px-5">サ活を記録</button>
        </Link>
      </div>

      {/* 7日間スコア推移 */}
      <div className="sauna-card mb-5">
        <p className="text-xs text-gray-400 mb-2 font-medium">直近7日間のととのい度</p>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={weeklyScores}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} hide />
            <Tooltip
              contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(v: number) => [v === 0 ? '—' : `★${v}`, 'ととのい度']}
            />
            <ReferenceLine y={0} stroke="#2E2E2E" />
            <Line type="monotone" dataKey="score" stroke="#D4853A" strokeWidth={2}
              dot={{ fill: '#D4853A', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#D4853A' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">最近のサ活</h2>
        <Link href="/facilities" className="text-xs text-[#D4853A] flex items-center gap-0.5">
          施設一覧 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="sauna-card animate-pulse">
              <div className="h-4 bg-[#2E2E2E] rounded w-2/3 mb-2" />
              <div className="h-3 bg-[#2E2E2E] rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-red-400 text-sm text-center py-6">{error}</p>
      )}

      {!loading && !error && recentFive.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">まだサ活の記録がありません</p>
          <p className="text-xs mt-1">「サ活を記録」から最初の記録を追加しましょう</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-3">
          {recentFive.map(session => (
            <Link key={session.id} href={`/sessions/${session.id}`} className="block">
            <div className="sauna-card hover:border-[#D4853A]/40 transition-colors duration-150">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">
                    {session.facility?.name ?? '施設未設定'}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(session.visitedAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ScoreChip score={session.totonoilScore} />
                  <StarRating value={session.totonoilScore} readonly size="sm" />
                </div>
              </div>

              {session.sets && session.sets.length > 0 && (
                <div className="flex gap-3 text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {session.sets.length}セット
                  </span>
                  {session.sets[0].saunaMinutes && (
                    <span>{session.sets[0].saunaMinutes}分</span>
                  )}
                  {session.sets[0].coldBathSeconds && (
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      {session.sets[0].coldBathSeconds}秒
                    </span>
                  )}
                  {session.sets.some(s => s.restType === 'outdoor') && (
                    <span className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-teal-400" />外気浴
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
