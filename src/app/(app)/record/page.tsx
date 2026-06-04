'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import SetInput from '@/components/record/SetInput'
import { mockFacilities } from '@/lib/mock-data'
import type { RecordFormData, SetInput as SetInputType } from '@/lib/types'

// TODO: Supabase接続 - 施設一覧をDBから取得する
// TODO: Supabase接続 - フォーム送信時にsessions/sets/conditionsをinsertする

const TOTAL_STEPS = 4

function newSet(setNumber: number): SetInputType {
  return { set_number: setNumber, sauna_minutes: 10, cold_bath_seconds: 60, loyly: false, rest_type: 'outdoor' }
}

const hungerLabels = {
  hungry: '空腹',
  normal: '普通',
  full: '満腹',
} as const

export default function RecordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState<RecordFormData>({
    facility_id: '',
    facility_name: '',
    visited_at: new Date().toISOString().slice(0, 16),
    sets: [newSet(1)],
    condition: { sleep_hours: 7, physical_condition: 3, hunger_level: 'normal' },
    totonoil_score: 0,
    memo: '',
  })

  function updateCondition<K extends keyof RecordFormData['condition']>(
    key: K,
    value: RecordFormData['condition'][K]
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
      sets: f.sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, set_number: i + 1 })),
    }))
  }

  function updateSet(index: number, data: SetInputType) {
    setForm(f => ({ ...f, sets: f.sets.map((s, i) => (i === index ? data : s)) }))
  }

  async function handleSubmit() {
    setSaving(true)
    // TODO: Supabase接続 - 以下を実際のDB insertに置き換える
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center pb-20">
        <div className="w-20 h-20 bg-[#D4853A]/20 rounded-3xl flex items-center justify-center mb-6">
          <span className="text-4xl">🧖</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">記録完了！</h2>
        <p className="text-gray-400 text-sm mb-1">ととのい度：</p>
        <StarRating value={form.totonoil_score} readonly size="lg" />
        {form.memo && (
          <p className="text-gray-300 text-sm mt-4 bg-[#1E1E1E] rounded-xl px-4 py-3 max-w-xs">
            {form.memo}
          </p>
        )}
        <button
          className="btn-amber mt-8"
          onClick={() => router.push('/home')}
        >
          ホームに戻る
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">サ活を記録</h1>
      </div>

      {/* ステッププログレス */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
              i + 1 <= step ? 'bg-[#D4853A]' : 'bg-[#2E2E2E]'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-4">STEP {step} / {TOTAL_STEPS}</p>

      {/* ステップ1: 施設 */}
      {step === 1 && (
        <div>
          <h2 className="section-title">施設と日時</h2>
          <div className="space-y-4">
            <div>
              <label className="label-text">施設を選ぶ</label>
              <select
                className="input-dark"
                value={form.facility_id}
                onChange={e => setForm(f => ({ ...f, facility_id: e.target.value, facility_name: '' }))}
              >
                <option value="">— 施設を選択 —</option>
                {mockFacilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
                <option value="__new__">+ 新しい施設を入力</option>
              </select>
            </div>

            {form.facility_id === '__new__' && (
              <div>
                <label className="label-text">施設名</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="例：サウナしきじ"
                  value={form.facility_name}
                  onChange={e => setForm(f => ({ ...f, facility_name: e.target.value }))}
                />
              </div>
            )}

            <div>
              <label className="label-text">訪問日時</label>
              <input
                type="datetime-local"
                className="input-dark"
                value={form.visited_at}
                onChange={e => setForm(f => ({ ...f, visited_at: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* ステップ2: コンディション */}
      {step === 2 && (
        <div>
          <h2 className="section-title">コンディション</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="label-text mb-0">昨夜の睡眠時間</label>
                <span className="text-[#D4853A] font-bold text-sm">
                  {form.condition.sleep_hours}h
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={form.condition.sleep_hours ?? 7}
                onChange={e => updateCondition('sleep_hours', parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3h</span>
                <span>10h</span>
              </div>
            </div>

            <div>
              <label className="label-text">体調</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => updateCondition('physical_condition', v)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                      form.condition.physical_condition === v
                        ? 'bg-[#D4853A] text-white'
                        : 'bg-[#252525] text-gray-400 border border-[#2E2E2E]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                <span>最悪</span>
                <span>最高</span>
              </div>
            </div>

            <div>
              <label className="label-text">空腹度</label>
              <div className="flex gap-2 mt-1">
                {(['hungry', 'normal', 'full'] as const).map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateCondition('hunger_level', h)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                      form.condition.hunger_level === h
                        ? 'bg-[#D4853A] text-white'
                        : 'bg-[#252525] text-gray-400 border border-[#2E2E2E]'
                    }`}
                  >
                    {hungerLabels[h]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ステップ3: セット入力 */}
      {step === 3 && (
        <div>
          <h2 className="section-title">セット詳細</h2>
          <div className="space-y-3">
            {form.sets.map((s, i) => (
              <SetInput
                key={i}
                index={i}
                data={s}
                onChange={data => updateSet(i, data)}
                onRemove={() => removeSet(i)}
                canRemove={form.sets.length > 1}
              />
            ))}
          </div>

          {form.sets.length < 5 && (
            <button
              type="button"
              onClick={addSet}
              className="w-full mt-3 py-3 rounded-xl border border-dashed border-[#D4853A]/50 text-[#D4853A] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#D4853A]/5 transition-colors duration-150"
            >
              <Plus className="w-4 h-4" />
              セットを追加（{form.sets.length}/5）
            </button>
          )}
        </div>
      )}

      {/* ステップ4: 結果 */}
      {step === 4 && (
        <div>
          <h2 className="section-title">ととのい結果</h2>
          <div className="sauna-card mb-4">
            <label className="label-text text-center block mb-3">ととのい度</label>
            <div className="flex justify-center">
              <StarRating
                value={form.totonoil_score}
                onChange={v => setForm(f => ({ ...f, totonoil_score: v }))}
                size="lg"
              />
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              {form.totonoil_score === 0 && '★をタップして評価'}
              {form.totonoil_score === 1 && 'イマイチ...'}
              {form.totonoil_score === 2 && 'まずまず'}
              {form.totonoil_score === 3 && 'よかった'}
              {form.totonoil_score === 4 && 'かなりととのった！'}
              {form.totonoil_score === 5 && '完全にととのった！🧖'}
            </p>
          </div>

          <div>
            <label className="label-text">一言メモ（任意）</label>
            <textarea
              className="input-dark resize-none"
              rows={3}
              placeholder="今日のサウナはどうでしたか？"
              value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* ナビゲーションボタン */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="btn-outline flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="btn-amber flex-1 flex items-center justify-center gap-1"
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || form.totonoil_score === 0}
            className="btn-amber flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>保存中...</>
            ) : (
              <>
                <Check className="w-4 h-4" />
                記録を保存
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
