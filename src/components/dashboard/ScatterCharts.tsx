'use client'

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis,
} from 'recharts'
import type { Session, SetData, Condition } from '@/lib/types'

type ColdBathProps = {
  sessions: Session[]
  sets: SetData[]
}

type SleepProps = {
  sessions: Session[]
  conditions: Condition[]
}

export function ColdBathScatter({ sessions, sets }: ColdBathProps) {
  const data = sessions
    .map(s => {
      const sessionSets = sets.filter(x => x.sessionId === s.id)
      if (sessionSets.length === 0) return null
      const avgCold = sessionSets.reduce((sum, x) => sum + (x.coldBathSeconds ?? 0), 0) / sessionSets.length
      return avgCold > 0 ? { cold: Math.round(avgCold), score: s.totonoilScore } : null
    })
    .filter(Boolean) as { cold: number; score: number }[]

  if (data.length === 0) {
    return <p className="text-xs text-gray-500 text-center py-8">データがありません</p>
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
        <XAxis dataKey="cold" name="水風呂" unit="秒"
          tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={{ stroke: '#2E2E2E' }} tickLine={false} />
        <YAxis dataKey="score" name="ととのい度" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <ZAxis range={[40, 40]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: '#3E3E3E' }}
          contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 10, fontSize: 12 }}
          formatter={(value: number, name: string) => [
            name === 'ととのい度' ? `★${value}` : `${value}秒`, name,
          ]}
        />
        <Scatter data={data} fill="#D4853A" opacity={0.85} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export function SleepScatter({ sessions, conditions }: SleepProps) {
  const data = sessions
    .map(s => {
      const cond = conditions.find(c => c.sessionId === s.id)
      return cond?.sleepHours != null ? { sleep: cond.sleepHours, score: s.totonoilScore } : null
    })
    .filter(Boolean) as { sleep: number; score: number }[]

  if (data.length === 0) {
    return <p className="text-xs text-gray-500 text-center py-8">データがありません</p>
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
        <XAxis dataKey="sleep" name="睡眠" unit="h"
          tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={{ stroke: '#2E2E2E' }} tickLine={false} />
        <YAxis dataKey="score" name="ととのい度" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <ZAxis range={[40, 40]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: '#3E3E3E' }}
          contentStyle={{ background: '#252525', border: '1px solid #3E3E3E', borderRadius: 10, fontSize: 12 }}
          formatter={(value: number, name: string) => [
            name === 'ととのい度' ? `★${value}` : `${value}h`, name,
          ]}
        />
        <Scatter data={data} fill="#60a5fa" opacity={0.85} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
