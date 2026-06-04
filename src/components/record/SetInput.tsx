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
          <input type="number" className="input-dark text-center" placeholder="10" min={1} max={30}
            value={data.saunaMinutes ?? ''}
            onChange={e => update('saunaMinutes', e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
        <div>
          <label className="label-text flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" />水風呂（秒）
          </label>
          <input type="number" className="input-dark text-center" placeholder="60" min={10} max={300} step={5}
            value={data.coldBathSeconds ?? ''}
            onChange={e => update('coldBathSeconds', e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
        <div>
          <label className="label-text flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-red-400" />室温（℃）
          </label>
          <input type="number" className="input-dark text-center" placeholder="80" min={60} max={110}
            value={data.saunaTemp ?? ''}
            onChange={e => update('saunaTemp', e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
        <div>
          <label className="label-text flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-300" />水風呂温度（℃）
          </label>
          <input type="number" className="input-dark text-center" placeholder="16" min={5} max={25}
            value={data.coldBathTemp ?? ''}
            onChange={e => update('coldBathTemp', e.target.value ? parseInt(e.target.value) : undefined)} />
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
