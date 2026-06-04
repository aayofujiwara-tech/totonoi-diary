'use client'

import { Trash2, Thermometer, Droplets } from 'lucide-react'
import type { SetFormItem } from '@/lib/types'

type Props = {
  index: number
  data: SetFormItem
  onChange: (data: SetFormItem) => void
  onRemove: () => void
  canRemove: boolean
}

const restTypeLabels = { outdoor: '屋外', indoor: '室内', none: 'なし' } as const

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function parseAndClamp(raw: string, min: number, max: number): number | undefined {
  if (!raw) return undefined
  const n = parseInt(raw, 10)
  return isNaN(n) ? undefined : clamp(n, min, max)
}

export default function SetInput({ index, data, onChange, onRemove, canRemove }: Props) {
  function update<K extends keyof SetFormItem>(key: K, value: SetFormItem[K]) {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="bg-[#252525] rounded-2xl p-4 border border-[#2E2E2E]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#D4853A] flex items-center justify-center text-xs font-bold text-white">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-white">セット{index + 1}</span>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-300 transition-colors" aria-label="セットを削除">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-text flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-orange-400" />サウナ（分）
          </label>
          <input
            type="number" className="input-dark text-center" placeholder="10"
            min={1} max={30}
            value={data.saunaMinutes ?? ''}
            onChange={e => update('saunaMinutes', parseAndClamp(e.target.value, 1, 30))}
            onBlur={e => {
              const v = parseAndClamp(e.target.value, 1, 30)
              if (v !== undefined) update('saunaMinutes', v)
            }}
          />
        </div>
        <div>
          <label className="label-text flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" />水風呂（秒）
          </label>
          <input
            type="number" className="input-dark text-center" placeholder="60"
            min={10} max={600} step={5}
            value={data.coldBathSeconds ?? ''}
            onChange={e => update('coldBathSeconds', parseAndClamp(e.target.value, 10, 600))}
            onBlur={e => {
              const v = parseAndClamp(e.target.value, 10, 600)
              if (v !== undefined) update('coldBathSeconds', v)
            }}
          />
        </div>
        <div>
          <label className="label-text flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-red-400" />室温（℃）
          </label>
          <input
            type="number" className="input-dark text-center" placeholder="80"
            min={60} max={130}
            value={data.saunaTemp ?? ''}
            onChange={e => update('saunaTemp', parseAndClamp(e.target.value, 60, 130))}
            onBlur={e => {
              const v = parseAndClamp(e.target.value, 60, 130)
              if (v !== undefined) update('saunaTemp', v)
            }}
          />
        </div>
        <div>
          <label className="label-text flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-300" />水風呂温度（℃）
          </label>
          <input
            type="number" className="input-dark text-center" placeholder="16"
            min={1} max={30}
            value={data.coldBathTemp ?? ''}
            onChange={e => update('coldBathTemp', parseAndClamp(e.target.value, 1, 30))}
            onBlur={e => {
              const v = parseAndClamp(e.target.value, 1, 30)
              if (v !== undefined) update('coldBathTemp', v)
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 py-2">
        <span className="text-sm text-gray-300">löyly（ロウリュ）あり</span>
        <button type="button" onClick={() => update('loyly', !data.loyly)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${data.loyly ? 'bg-[#D4853A]' : 'bg-[#3E3E3E]'}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${data.loyly ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="mt-2">
        <label className="label-text">外気浴スペース</label>
        <div className="flex gap-2">
          {(['outdoor', 'indoor', 'none'] as const).map(type => (
            <button key={type} type="button" onClick={() => update('restType', type)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${data.restType === type ? 'bg-[#D4853A] text-white' : 'bg-[#1E1E1E] text-gray-400 border border-[#2E2E2E]'}`}>
              {restTypeLabels[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
