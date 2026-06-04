'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import SetInput from '@/components/record/SetInput'
import { useAuth } from '@/hooks/useAuth'
import { getFacilities, saveRecord } from '@/lib/firebase/db'
import type { Facility, RecordFormData, SetFormItem } from '@/lib/types'

const TOTAL_STEPS = 4

function newSet(setNumber: number): SetFormItem {
  return { setNumber, saunaMinutes: 10, coldBathSeconds: 60, loyly: false, restType: 'outdoor' }
}

const hungerLabels = { hungry: '空腹', normal: '普通', full: '満腹' } as const

export default function RecordPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [form, setForm] = useState<RecordFormData>({
    facilityId: '',
    facilityName: '',
    visitedAt: new Date().toISOString().slice(0, 16),
    sets: [newSet(1)],
    condition: { sleepHours: 7, physicalCondition: 3, hungerLevel: 'normal' },
    totonoilScore: 0,
    memo: '',
  })

  useEffect(() => {
    if (!user) return
    getFacilities(user.uid).then(setFacilities).catch(() => {})
  }, [user])

  function updateCondition<K extends keyof RecordFormData['condition']>(
    key: K, value: RecordFormData['condition'][K]
  ) {
    setForm(f => ({ ...f, condition: { ...f.condition, [key]: value } }))
  }

  function addSet() {
    if (form.sets.length >= 5) return
    setForm(f => ({ ...f, sets: [...f.sets, newSet(f.sets.length + 1)] }))
  }

  function removeSet(index: number) {
    setForm(f => ({
      ...f,
      sets: f.sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 })),
    }))
  }

  function updateSet(index: number, data: SetFormItem) {
    setForm(f => ({ ...f, sets: f.sets.map((s, i) => (i === index ? data : s)) }))
  }

  async function handleSubmit() {
    if (!user) {
      setSaveError('ログインが必要です。再ログインしてください。')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      await saveRecord(user.uid, form)
      setDone(true)
    } catch (err) {
      console.error('saveRecord error:', err)
      setSaveError('保存に失敗しました。通信環境を確認して再試行してください。')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center pb-20">
        <div className="w-20 h-20 bg-[#D4853A]/20 rounded-3xl flex items-center justify-center mb-6">
          <span className="text-4xl">🧖</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">記録完了！</h2>
        <p className="text-gray-400 text-sm mb-1">ととのい度：</p>
        <StarRating value={form.totonoilScore} readonly size="lg" />
        {form.memo && (
          <p className="text-gray-300 text-sm mt-4 bg-[#1E1E1E] rounded-xl px-4 py-3 max-w-xs">{form.memo}</p>
        )}
        <button className="btn-amber mt-8" onClick={() => router.push('/home')}>
          ホームに戻る
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">サ活を記録</h1>
      </div>

      {/* プログレスバー */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${i + 1 <= step ? 'bg-[#D4853A]' : 'bg-[#2E2E2E]'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-4">STEP {step} / {TOTAL_STEPS}</p>

      {/* Step 1: 施設 */}
      {step === 1 && (
        <div>
          <h2 className="section-title">施設と日時</h2>
          <div className="space-y-4">
            <div>
              <label className="label-text">施設を選ぶ</label>
              <select
                className="input-dark"
                value={form.facilityId}
                onChange={e => setForm(f => ({ ...f, facilityId: e.target.value, facilityName: '' }))}
              >
                <option value="">— 施設を選択 —</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
                <option value="__new__">+ 新しい施設を入力</option>
              </select>
            </div>
            {form.facilityId === '__new__' && (
              <div>
                <label className="label-text">施設名</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="例：サウナしきじ"
                  value={form.facilityName}
                  onChange={e => setForm(f => ({ ...f, facilityName: e.target.value }))}
                />
              </div>
            )}
            <div>
              <label className="label-text">訪問日時</label>
              <input
                type="datetime-local"
                className="input-dark"
                value={form.visitedAt}
                onChange={e => setForm(f => ({ ...f, visitedAt: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: コンディション */}
      {step === 2 && (
        <div>
          <h2 className="section-title">コンディション</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="label-text mb-0">昨夜の睡眠時間</label>
                <span className="text-[#D4853A] font-bold text-sm">{form.condition.sleepHours}h</span>
              </div>
              <input
                type="range" min={3} max={10} step={0.5}
                value={form.condition.sleepHours ?? 7}
                onChange={e => updateCondition('sleepHours', parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3h</span><span>10h</span>
              </div>
            </div>
            <div>
              <label className="label-text">体調</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button"
                    onClick={() => updateCondition('physicalCondition', v)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${form.condition.physicalCondition === v ? 'bg-[#D4853A] text-white' : 'bg-[#252525] text-gray-400 border border-[#2E2E2E]'}`}
                  >{v}</button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                <span>最悪</span><span>最高</span>
              </div>
            </div>
            <div>
              <label className="label-text">空腹度</label>
              <div className="flex gap-2 mt-1">
                {(['hungry', 'normal', 'full'] as const).map(h => (
                  <button key={h} type="button"
                    onClick={() => updateCondition('hungerLevel', h)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${form.condition.hungerLevel === h ? 'bg-[#D4853A] text-white' : 'bg-[#252525] text-gray-400 border border-[#2E2E2E]'}`}
                  >{hungerLabels[h]}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: セット */}
      {step === 3 && (
        <div>
          <h2 className="section-title">セット詳細</h2>
          <div className="space-y-3">
            {form.sets.map((s, i) => (
              <SetInput
                key={i} index={i} data={s}
                onChange={data => updateSet(i, data)}
                onRemove={() => removeSet(i)}
                canRemove={form.sets.length > 1}
              />
            ))}
          </div>
          {form.sets.length < 5 && (
            <button type="button" onClick={addSet}
              className="w-full mt-3 py-3 rounded-xl border border-dashed border-[#D4853A]/50 text-[#D4853A] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#D4853A]/5 transition-colors duration-150"
            >
              <Plus className="w-4 h-4" />
              セットを追加（{form.sets.length}/5）
            </button>
          )}
        </div>
      )}

      {/* Step 4: 結果 */}
      {step === 4 && (
        <div>
          <h2 className="section-title">ととのい結果</h2>
          <div className="sauna-card mb-4">
            <label className="label-text text-center block mb-3">ととのい度</label>
            <div className="flex justify-center">
              <StarRating value={form.totonoilScore} onChange={v => setForm(f => ({ ...f, totonoilScore: v }))} size="lg" />
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              {['★をタップして評価', 'イマイチ...', 'まずまず', 'よかった', 'かなりととのった！', '完全にととのった！🧖'][form.totonoilScore]}
            </p>
          </div>
          <div>
            <label className="label-text">一言メモ（任意）</label>
            <textarea
              className="input-dark resize-none" rows={3}
              placeholder="今日のサウナはどうでしたか？"
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button type="button" onClick={() => setStep(s => s - 1)} className="btn-outline flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />戻る
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button type="button" onClick={() => setStep(s => s + 1)} className="btn-amber flex-1 flex items-center justify-center gap-1">
            次へ <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex-1 flex flex-col gap-2">
            {step === TOTAL_STEPS && form.totonoilScore === 0 && (
              <p className="text-xs text-amber-400 text-center">★をタップしてととのい度を選んでください</p>
            )}
            {saveError && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2 text-center">{saveError}</p>
            )}
            <button type="button" onClick={handleSubmit}
              disabled={saving || authLoading || form.totonoilScore === 0}
              className="btn-amber w-full flex items-center justify-center gap-2"
            >
              {saving ? '保存中...' : authLoading ? '準備中...' : <><Check className="w-4 h-4" />記録を保存</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
