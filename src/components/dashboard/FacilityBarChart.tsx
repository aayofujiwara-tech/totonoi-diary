'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { mockFacilities, mockSessions } from '@/lib/mock-data'

// TODO: Supabase接続 - facilities + sessionsをDBから取得してJOINする

export default function FacilityBarChart() {
  const data = mockFacilities
    .map(f => {
      const sessions = mockSessions.filter(s => s.facility_id === f.id)
      const avg = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.totonoil_score, 0) / sessions.length
        : 0
      return { name: f.name.slice(0, 8), avg: Math.round(avg * 10) / 10, count: sessions.length }
    })
    .filter(d => d.count > 0)
    .sort((a, b) => b.avg - a.avg)

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: '#9ca3af' }}
          axisLine={{ stroke: '#2E2E2E' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 10, fontSize: 12 }}
          formatter={(value: number, _: string, entry) => [
            `★${value} （${(entry.payload as { count: number })?.count ?? 0}回）`,
            '平均ととのい度',
          ]}
        />
        <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={index === 0 ? '#D4853A' : `rgba(212,133,58,${0.6 - index * 0.12})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
