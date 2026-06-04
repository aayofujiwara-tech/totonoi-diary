'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Pencil, Trash2, Flame, Droplets,
  Wind, MapPin, Moon, Zap, Utensils, Star,
} from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { useAuth } from '@/hooks/useAuth'
import { getSession, deleteRecord } from '@/lib/firebase/db'
import type { Session } from '@/lib/types'

const restTypeLabel = { outdoor: '屋外', indoor: '室内', none: 'なし' } as const
const hungerLabel = { hungry: '空腹', normal: '普通', full: '満腹' } as const

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function SessionDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    console.log('[SessionDetail] effect fired — id:', id, 'authLoading:', authLoading, 'uid:', user?.uid ?? 'null')
    if (!id || authLoading) return
    if (!user) { setLoading(false); return }
    getSession(id)
      .then(result => {
        console.log('[SessionDetail] getSession result:', result ? `found (id=${result.id})` : 'null')
        setSession(result)
      })
      .catch(err => {
        console.error('[SessionDetail] getSession error:', err?.code, err?.message, err)
        setFetchError(String(err?.code ?? err?.message ?? err))
      })
      .finally(() => setLoading(false))
  }, [id, user, authLoading])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteRecord(id)
      router.replace('/home')
    } catch (err) {
      console.error('[delete]', err)
      alert('削除に失敗しました。再試行してください。')
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400"><ChevronLeft className="w-6 h-6" /></button>
          <div className="h-5 bg-[#2E2E2E] rounded w-32 animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => <div key={i} className="sauna-card mb-3 h-24 animate-pulse" />)}
      </div>
    )
  }

  if (!session) {
    return (
      <div className="px-4 pt-6 text-center text-gray-500 space-y-2">
        <p>記録が見つかりません</p>
        <p className="text-xs text-gray-600">id: {id} / uid: {user?.uid ?? 'null'}</p>
        {fetchError && <p className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2">{fetchError}</p>}
        <Link href="/home" className="text-[#D4853A] text-sm mt-4 inline-block">ホームに戻る</Link>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <Link href={`/record/${id}/edit`}>
            <button className="flex items-center gap-1.5 bg-[#252525] border border-[#2E2E2E] text-gray-200 text-sm font-medium px-4 py-2 rounded-xl hover:border-[#D4853A]/50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />編集
            </button>
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 bg-[#252525] border border-[#2E2E2E] text-red-400 text-sm font-medium px-4 py-2 rounded-xl hover:border-red-800/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />削除
          </button>
        </div>
      </div>

      {/* 施設・日時・スコア */}
      <div className="sauna-card mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-white mb-0.5">
              {session.facility?.name ?? '施設未設定'}
            </h1>
            {session.facility?.address && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3" />{session.facility.address}
              </p>
            )}
            <p className="text-sm text-gray-400">{formatDateTime(session.visitedAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StarRating value={session.totonoilScore} readonly size="md" />
            <span className="text-xs text-gray-400">ととのい度</span>
          </div>
        </div>
        {session.memo && (
          <p className="mt-3 pt-3 border-t border-[#2E2E2E] text-sm text-gray-300">{session.memo}</p>
        )}
      </div>

      {/* コンディション */}
      {session.condition && (
        <div className="sauna-card mb-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">コンディション</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            {session.condition.sleepHours != null && (
              <div>
                <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{session.condition.sleepHours}h</p>
                <p className="text-xs text-gray-500">睡眠</p>
              </div>
            )}
            {session.condition.physicalCondition != null && (
              <div>
                <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{session.condition.physicalCondition}/5</p>
                <p className="text-xs text-gray-500">体調</p>
              </div>
            )}
            {session.condition.hungerLevel && (
              <div>
                <Utensils className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-base font-bold text-white">{hungerLabel[session.condition.hungerLevel]}</p>
                <p className="text-xs text-gray-500">空腹度</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* セット詳細 */}
      {session.sets && session.sets.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-2">セット詳細</h2>
          <div className="space-y-2">
            {session.sets.map(s => (
              <div key={s.id} className="sauna-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#D4853A] flex items-center justify-center text-xs font-bold text-white">{s.setNumber}</span>
                  <span className="text-sm font-medium text-white">セット{s.setNumber}</span>
                  {s.loyly && (
                    <span className="text-xs bg-orange-900/50 text-orange-300 px-1.5 py-0.5 rounded-full">🔥 löyly</span>
                  )}
                  <span className="ml-auto text-xs text-gray-400">{restTypeLabel[s.restType]}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  {s.saunaMinutes != null && (
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {s.saunaMinutes}分
                      {s.saunaTemp != null && <span className="text-gray-500">/ {s.saunaTemp}℃</span>}
                    </span>
                  )}
                  {s.coldBathSeconds != null && (
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      {s.coldBathSeconds}秒
                      {s.coldBathTemp != null && <span className="text-gray-500">/ {s.coldBathTemp}℃</span>}
                    </span>
                  )}
                  {s.restType === 'outdoor' && (
                    <span className="flex items-center gap-1 col-span-2">
                      <Wind className="w-3 h-3 text-teal-400" />外気浴
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-6">
          <div className="bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-sm border border-[#2E2E2E]">
            <h3 className="text-lg font-bold text-white mb-2">記録を削除しますか？</h3>
            <p className="text-sm text-gray-400 mb-6">この操作は取り消せません。セット・コンディションも全て削除されます。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-[#2E2E2E] text-gray-300 text-sm font-semibold"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
