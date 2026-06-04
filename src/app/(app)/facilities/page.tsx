'use client'

import { useState } from 'react'
import { Plus, X, MapPin, Flame, ChevronRight } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { mockFacilities, mockSessions } from '@/lib/mock-data'
import type { Facility } from '@/lib/types'

// TODO: Supabase接続 - 施設一覧をDBから取得する
// TODO: Supabase接続 - 施設追加をDBにinsertする

function getFacilityStats(facilityId: string) {
  const sessions = mockSessions.filter(s => s.facility_id === facilityId)
  const avg = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.totonoil_score, 0) / sessions.length
    : 0
  return { count: sessions.length, avg: Math.round(avg * 10) / 10 }
}

type ModalProps = {
  onClose: () => void
  onSave: (f: Omit<Facility, 'id' | 'user_id' | 'created_at'>) => void
}

function AddFacilityModal({ onClose, onSave }: ModalProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loyly, setLoyly] = useState(false)
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), address, loyly, notes })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-[#1E1E1E] rounded-t-3xl w-full max-w-[430px] p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">施設を追加</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">施設名 *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="例：サウナしきじ"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label-text">住所（任意）</label>
            <input
              type="text"
              className="input-dark"
              placeholder="例：静岡県静岡市..."
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">löyly（ロウリュ）あり</span>
            <button
              type="button"
              onClick={() => setLoyly(!loyly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${loyly ? 'bg-[#D4853A]' : 'bg-[#3E3E3E]'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${loyly ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>
          <div>
            <label className="label-text">メモ（任意）</label>
            <input
              type="text"
              className="input-dark"
              placeholder="例：水風呂が天然水"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-amber w-full mt-2">
            追加する
          </button>
        </form>
      </div>
    </div>
  )
}

type DetailProps = {
  facility: Facility
  onClose: () => void
}

function FacilityDetail({ facility, onClose }: DetailProps) {
  const { count, avg } = getFacilityStats(facility.id)
  const sessions = mockSessions
    .filter(s => s.facility_id === facility.id)
    .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
      <div className="fixed inset-0" onClick={onClose} aria-hidden />
      <div className="relative bg-[#1E1E1E] rounded-t-3xl w-full max-w-[430px] p-6 pb-10 max-h-[80dvh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">{facility.name}</h2>
            {facility.address && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {facility.address}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="sauna-card flex-1 text-center">
            <p className="text-2xl font-bold text-[#D4853A]">{count}</p>
            <p className="text-xs text-gray-400">訪問回数</p>
          </div>
          <div className="sauna-card flex-1 text-center">
            <p className="text-2xl font-bold text-[#D4853A]">{avg > 0 ? avg.toFixed(1) : '—'}</p>
            <p className="text-xs text-gray-400">平均ととのい度</p>
          </div>
          <div className="sauna-card flex-1 text-center">
            <p className="text-2xl font-bold text-[#D4853A]">{facility.loyly ? '🔥' : '—'}</p>
            <p className="text-xs text-gray-400">löyly</p>
          </div>
        </div>

        {facility.notes && (
          <p className="text-sm text-gray-300 bg-[#252525] rounded-xl px-3 py-2 mb-4">{facility.notes}</p>
        )}

        <h3 className="text-sm font-semibold text-gray-300 mb-2">訪問履歴</h3>
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-500">まだ訪問記録がありません</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#2E2E2E]">
                <p className="text-sm text-gray-300">
                  {new Date(s.visited_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </p>
                <StarRating value={s.totonoil_score} readonly size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilities)
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Facility | null>(null)

  function handleAddFacility(data: Omit<Facility, 'id' | 'user_id' | 'created_at'>) {
    // TODO: Supabase接続 - DBにinsertして返ってきたデータを使う
    const newFacility: Facility = {
      ...data,
      id: `f_${Date.now()}`,
      user_id: 'u1',
      created_at: new Date().toISOString(),
    }
    setFacilities(prev => [...prev, newFacility])
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">施設マスタ</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-[#D4853A] text-white text-sm font-semibold px-4 py-2 rounded-xl active:bg-[#B36A20] transition-colors"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      <div className="space-y-3">
        {facilities.map(facility => {
          const { count, avg } = getFacilityStats(facility.id)
          return (
            <button
              key={facility.id}
              onClick={() => setSelected(facility)}
              className="sauna-card w-full text-left hover:border-[#D4853A]/40 transition-colors duration-150"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white text-sm">{facility.name}</h3>
                    {facility.loyly && (
                      <span className="text-xs bg-orange-900/50 text-orange-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        löyly
                      </span>
                    )}
                  </div>
                  {facility.address && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{facility.address}</span>
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              </div>

              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>{count}回訪問</span>
                {avg > 0 && (
                  <span className="flex items-center gap-1">
                    平均 <StarRating value={Math.round(avg)} readonly size="sm" />
                    <span className="text-[#D4853A] font-semibold">{avg.toFixed(1)}</span>
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {facilities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">施設が登録されていません</p>
          <p className="text-xs mt-1">「追加」から施設を登録しましょう</p>
        </div>
      )}

      {showAdd && (
        <AddFacilityModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddFacility}
        />
      )}

      {selected && (
        <FacilityDetail
          facility={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
