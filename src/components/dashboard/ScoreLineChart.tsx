'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { mockSessions } from '@/lib/mock-data'

// TODO: Supabase接続 - sessionsをDBから取得する

function buildChartData() {
  return [...mockSessions]
    .sort((a, b) => new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime())
    .map(s => ({
      date: new Date(s.visited_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      score: s.totonoil_score,
      facility: s.facility?.name ?? '',
    }))
}

export default function ScoreLineChart() {
  const data = buildChartData()

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={{ stroke: '#2E2E2E' }}
          tickLine={false}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#D4853A', fontWeight: 'bold' }}
          formatter={(value: number, _: string, entry) => [
            `★${value}`,
            (entry.payload as { facility: string })?.facility ?? '',
          ]}
        />
        <ReferenceLine y={3} stroke="#3E3E3E" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#D4853A"
          strokeWidth={2.5}
          dot={{ fill: '#D4853A', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#E8A05A' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
