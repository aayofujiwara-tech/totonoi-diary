'use client'

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis,
} from 'recharts'
import { mockSessions } from '@/lib/mock-data'

// TODO: Supabase接続 - sessionsとconditionsをJOINしてDBから取得する

export function ColdBathScatter() {
  const data = mockSessions
    .filter(s => s.sets && s.sets.length > 0)
    .map(s => {
      const avgCold = s.sets!.reduce((sum, set) => sum + (set.cold_bath_seconds ?? 0), 0) / s.sets!.length
      return { cold: Math.round(avgCold), score: s.totonoil_score }
    })
    .filter(d => d.cold > 0)

  return (
    <ResponsiveContainer width="100%" height={160}>
      <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
        <XAxis
          dataKey="cold"
          name="水風呂"
          unit="秒"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={{ stroke: '#2E2E2E' }}
          tickLine={false}
        />
        <YAxis
          dataKey="score"
          name="ととのい度"
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <ZAxis range={[40, 40]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: '#3E3E3E' }}
          contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 10, fontSize: 12 }}
          formatter={(value: number, name: string) => [
            name === 'ととのい度' ? `★${value}` : `${value}秒`,
            name,
          ]}
        />
        <Scatter data={data} fill="#D4853A" opacity={0.85} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export function SleepScatter() {
  const data = mockSessions
    .filter(s => s.condition?.sleep_hours != null)
    .map(s => ({
      sleep: s.condition!.sleep_hours!,
      score: s.totonoil_score,
    }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
        <XAxis
          dataKey="sleep"
          name="睡眠"
          unit="h"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={{ stroke: '#2E2E2E' }}
          tickLine={false}
        />
        <YAxis
          dataKey="score"
          name="ととのい度"
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <ZAxis range={[40, 40]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: '#3E3E3E' }}
          contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 10, fontSize: 12 }}
          formatter={(value: number, name: string) => [
            name === 'ととのい度' ? `★${value}` : `${value}h`,
            name,
          ]}
        />
        <Scatter data={data} fill="#60a5fa" opacity={0.85} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
