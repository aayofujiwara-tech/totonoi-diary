'use client'

import { useState, useEffect } from 'react'
import { Plus, X, MapPin, Flame, ChevronRight, Trash2, AlertTriangle } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { useAuth } from '@/hooks/useAuth'
import { getFacilities, addFacility, getAllSessionsForDashboard, deleteFacility } from '@/lib/firebase/db'
import type { Facility, Session } from '@/lib/types'

type FacilityStats = { count: number; avg: number }

function AddFacilityModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (data: Omit<Facility, 'id' | 'userId' | 'createdAt'>) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loyly, setLoyly] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), address, loyly, notes })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
      <div className="fixed inset-0" onClick={onClose} aria-hidden />
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
            <input type="text" className="input-dark" placeholder="例：サウナしきじ"
              value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label-text">住所（任意）</label>
            <input type="text" className="input-dark" placeholder="例：静岡県静岡市..."
              value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">löyly（ロウリュ）あり</span>
            <button type="button" onClick={() => setLoyly(!loyly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${loyly ? 'bg-[#D4853A]' : 'bg-[#3E3E3E]'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${loyly ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div>
            <label className="label-text">メモ（任意）</label>
            <input type="text" className="input-dark" placeholder="例：水風呂が天然水"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn-amber w-full mt-2" disabled={saving}>
            {saving ? '追加中...' : '追加する'}
          </button>
        </form>
      </div>
    </div>
  )
}

function FacilityDetail({
  facility,
  sessions,
  onClose,
}: {
  facility: Facility
  sessions: Session[]
  onClose: () => void
}) {
  const facilSessions = sessions
    .filter(s => s.facilityId === facility.id)
    .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())

  const avg = facilSessions.length > 0
    ? facilSessions.reduce((s, x) => s + x.totonoilScore, 0) / facilSessions.length
    : 0

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
      <div className="fixed inset-0" onClick={onClose} aria-hidden />
      <div className="relative bg-[#1E1E1E] rounded-t-3xl w-full max-w-[430px] p-6 pb-10 max-h-[80dvh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">{facility.name}</h2>
            {facility.address && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{facility.address}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="sauna-card flex-1 text-center">
            <p className="text-2xl font-bold text-[#D4853A]">{facilSessions.length}</p>
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
        {facilSessions.length === 0 ? (
          <p className="text-xs text-gray-500">まだ訪問記録がありません</p>
        ) : (
          <div className="space-y-2">
            {facilSessions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#2E2E2E]">
                <p className="text-sm text-gray-300">
                  {new Date(s.visitedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </p>
                <StarRating value={s.totonoilScore} readonly size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  facility,
  sessionCount,
  onClose,
  onConfirm,
}: {
  facility: Facility
  sessionCount: number
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-6">
      <div className="bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-sm border border-[#2E2E2E]">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-bold text-white">施設を削除しますか？</h3>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          <span className="font-semibold text-white">「{facility.name}」</span> を削除します。
        </p>
        {sessionCount > 0 && (
          <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-3 py-2.5 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300">
              この施設には <span className="font-bold">{sessionCount}件</span> のサ活記録があります。
              施設を削除してもサ活記録は残りますが、施設名が表示されなくなります。
            </p>
          </div>
        )}
        <p className="text-xs text-gray-500 mb-5">この操作は取り消せません。</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#2E2E2E] text-gray-300 text-sm font-semibold">
            キャンセル
          </button>
          <button onClick={handleConfirm} disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
            {deleting ? '削除中...' : '削除する'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FacilitiesPage() {
  const { user } = useAuth()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Facility | null>(null)
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null)
  const [statsMap, setStatsMap] = useState<Map<string, FacilityStats>>(new Map())

  useEffect(() => {
    if (!user) return
    Promise.all([
      getFacilities(user.uid),
      getAllSessionsForDashboard(user.uid),
    ]).then(([facs, data]) => {
      setFacilities(facs)
      setSessions(data.sessions)
      const map = new Map<string, FacilityStats>()
      facs.forEach(f => {
        const s = data.sessions.filter(x => x.facilityId === f.id)
        const avg = s.length > 0 ? s.reduce((a, x) => a + x.totonoilScore, 0) / s.length : 0
        map.set(f.id, { count: s.length, avg: Math.round(avg * 10) / 10 })
      })
      setStatsMap(map)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  async function handleAddFacility(data: Omit<Facility, 'id' | 'userId' | 'createdAt'>) {
    if (!user) return
    const id = await addFacility(user.uid, data)
    const newFac: Facility = { ...data, id, userId: user.uid, createdAt: new Date().toISOString() }
    setFacilities(prev => [newFac, ...prev])
    setStatsMap(prev => new Map(prev).set(id, { count: 0, avg: 0 }))
  }

  async function handleDeleteFacility() {
    if (!facilityToDelete) return
    await deleteFacility(facilityToDelete.id)
    setFacilities(prev => prev.filter(f => f.id !== facilityToDelete.id))
    setStatsMap(prev => { const m = new Map(prev); m.delete(facilityToDelete.id); return m })
    setFacilityToDelete(null)
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">施設マスタ</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-[#D4853A] text-white text-sm font-semibold px-4 py-2 rounded-xl active:bg-[#B36A20] transition-colors">
          <Plus className="w-4 h-4" />追加
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="sauna-card animate-pulse">
              <div className="h-4 bg-[#2E2E2E] rounded w-1/2 mb-2" />
              <div className="h-3 bg-[#2E2E2E] rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && facilities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">施設が登録されていません</p>
          <p className="text-xs mt-1">「追加」から施設を登録しましょう</p>
        </div>
      )}

      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {facilities.map(facility => {
            const stats = statsMap.get(facility.id) ?? { count: 0, avg: 0 }
            return (
              <div key={facility.id} className="sauna-card hover:border-[#D4853A]/40 transition-colors duration-150">
                <div className="flex items-start justify-between">
                  {/* カード本体（詳細表示） */}
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => setSelected(facility)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-sm">{facility.name}</h3>
                      {facility.loyly && (
                        <span className="text-xs bg-orange-900/50 text-orange-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />löyly
                        </span>
                      )}
                    </div>
                    {facility.address && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{facility.address}</span>
                      </p>
                    )}
                  </button>
                  {/* アクションボタン */}
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => setFacilityToDelete(facility)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/20"
                      aria-label="施設を削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelected(facility)}
                      className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label="詳細を表示"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{stats.count}回訪問</span>
                  {stats.avg > 0 && (
                    <span className="flex items-center gap-1">
                      平均 <StarRating value={Math.round(stats.avg)} readonly size="sm" />
                      <span className="text-[#D4853A] font-semibold">{stats.avg.toFixed(1)}</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <AddFacilityModal onClose={() => setShowAdd(false)} onSave={handleAddFacility} />
      )}
      {selected && (
        <FacilityDetail facility={selected} sessions={sessions} onClose={() => setSelected(null)} />
      )}
      {facilityToDelete && (
        <DeleteConfirmModal
          facility={facilityToDelete}
          sessionCount={sessions.filter(s => s.facilityId === facilityToDelete.id).length}
          onClose={() => setFacilityToDelete(null)}
          onConfirm={handleDeleteFacility}
        />
      )}
    </div>
  )
}
