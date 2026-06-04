'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { Session } from '@/lib/types'

type Props = { sessions: Session[] }

export default function ScoreLineChart({ sessions }: Props) {
  const data = [...sessions]
    .sort((a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime())
    .map(s => ({
      date: new Date(s.visitedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      score: s.totonoilScore,
      facility: s.facility?.name ?? '',
    }))

  if (data.length === 0) {
    return <p className="text-xs text-gray-500 text-center py-8">データがありません</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={{ stroke: '#2E2E2E' }} tickLine={false} />
        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#D4853A', fontWeight: 'bold' }}
          formatter={(value: number, _: string, entry) => [
            `★${value}`,
            (entry.payload as { facility: string })?.facility ?? '',
          ]}
        />
        <ReferenceLine y={3} stroke="#3E3E3E" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="score" stroke="#D4853A" strokeWidth={2.5}
          dot={{ fill: '#D4853A', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#E8A05A' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
