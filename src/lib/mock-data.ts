import type { Facility, Session } from './types'

export const mockFacilities: Facility[] = [
  {
    id: 'f1',
    user_id: 'u1',
    name: 'サウナしきじ',
    address: '静岡県静岡市駿河区敷地2-25-1',
    loyly: true,
    notes: '水風呂が天然水で最高',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'f2',
    user_id: 'u1',
    name: 'スパメッツァ おおたか',
    address: '千葉県流山市おおたかの森南2-1-2',
    loyly: true,
    notes: 'ロウリュイベントが熱い',
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'f3',
    user_id: 'u1',
    name: 'ラクーア',
    address: '東京都文京区春日1-1-1',
    loyly: false,
    notes: '駅近で便利',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'f4',
    user_id: 'u1',
    name: 'サウナ東京',
    address: '東京都港区赤坂2-6-23',
    loyly: true,
    notes: 'ドライサウナが本格的',
    created_at: '2024-02-15T00:00:00Z',
  },
]

export const mockSessions: Session[] = [
  {
    id: 's1',
    user_id: 'u1',
    facility_id: 'f1',
    visited_at: '2026-05-28T14:00:00Z',
    totonoil_score: 5,
    memo: '水風呂が神だった。ロウリュ後すぐ入ったのが良かった',
    created_at: '2026-05-28T16:00:00Z',
    facility: mockFacilities[0],
    sets: [
      { id: 'set1', session_id: 's1', set_number: 1, sauna_minutes: 10, cold_bath_seconds: 90, loyly: true, rest_type: 'outdoor' },
      { id: 'set2', session_id: 's1', set_number: 2, sauna_minutes: 12, cold_bath_seconds: 120, loyly: false, rest_type: 'outdoor' },
      { id: 'set3', session_id: 's1', set_number: 3, sauna_minutes: 8, cold_bath_seconds: 90, loyly: true, rest_type: 'outdoor' },
    ],
    condition: { id: 'c1', session_id: 's1', sleep_hours: 8, physical_condition: 5, hunger_level: 'normal' },
  },
  {
    id: 's2',
    user_id: 'u1',
    facility_id: 'f2',
    visited_at: '2026-05-25T10:00:00Z',
    totonoil_score: 4,
    memo: 'ロウリュイベントが熱かった',
    created_at: '2026-05-25T13:00:00Z',
    facility: mockFacilities[1],
    sets: [
      { id: 'set4', session_id: 's2', set_number: 1, sauna_minutes: 8, cold_bath_seconds: 60, loyly: true, rest_type: 'outdoor' },
      { id: 'set5', session_id: 's2', set_number: 2, sauna_minutes: 10, cold_bath_seconds: 90, loyly: true, rest_type: 'indoor' },
    ],
    condition: { id: 'c2', session_id: 's2', sleep_hours: 7, physical_condition: 4, hunger_level: 'normal' },
  },
  {
    id: 's3',
    user_id: 'u1',
    facility_id: 'f3',
    visited_at: '2026-05-22T18:00:00Z',
    totonoil_score: 3,
    memo: '疲れていたが気分転換になった',
    created_at: '2026-05-22T20:00:00Z',
    facility: mockFacilities[2],
    sets: [
      { id: 'set6', session_id: 's3', set_number: 1, sauna_minutes: 6, cold_bath_seconds: 45, loyly: false, rest_type: 'indoor' },
      { id: 'set7', session_id: 's3', set_number: 2, sauna_minutes: 8, cold_bath_seconds: 60, loyly: false, rest_type: 'indoor' },
    ],
    condition: { id: 'c3', session_id: 's3', sleep_hours: 5, physical_condition: 2, hunger_level: 'full' },
  },
  {
    id: 's4',
    user_id: 'u1',
    facility_id: 'f4',
    visited_at: '2026-05-18T11:00:00Z',
    totonoil_score: 5,
    memo: 'ドライサウナで完全にととのった',
    created_at: '2026-05-18T14:00:00Z',
    facility: mockFacilities[3],
    sets: [
      { id: 'set8', session_id: 's4', set_number: 1, sauna_minutes: 12, cold_bath_seconds: 120, loyly: false, rest_type: 'outdoor' },
      { id: 'set9', session_id: 's4', set_number: 2, sauna_minutes: 15, cold_bath_seconds: 150, loyly: false, rest_type: 'outdoor' },
      { id: 'set10', session_id: 's4', set_number: 3, sauna_minutes: 10, cold_bath_seconds: 120, loyly: false, rest_type: 'outdoor' },
    ],
    condition: { id: 'c4', session_id: 's4', sleep_hours: 8, physical_condition: 5, hunger_level: 'hungry' },
  },
  {
    id: 's5',
    user_id: 'u1',
    facility_id: 'f1',
    visited_at: '2026-05-14T15:00:00Z',
    totonoil_score: 4,
    memo: '',
    created_at: '2026-05-14T17:00:00Z',
    facility: mockFacilities[0],
    sets: [
      { id: 'set11', session_id: 's5', set_number: 1, sauna_minutes: 10, cold_bath_seconds: 90, loyly: true, rest_type: 'outdoor' },
      { id: 'set12', session_id: 's5', set_number: 2, sauna_minutes: 10, cold_bath_seconds: 90, loyly: true, rest_type: 'outdoor' },
    ],
    condition: { id: 'c5', session_id: 's5', sleep_hours: 7.5, physical_condition: 4, hunger_level: 'normal' },
  },
  {
    id: 's6',
    user_id: 'u1',
    facility_id: 'f2',
    visited_at: '2026-05-10T09:00:00Z',
    totonoil_score: 2,
    memo: '二日酔いで辛かった',
    created_at: '2026-05-10T12:00:00Z',
    facility: mockFacilities[1],
    sets: [
      { id: 'set13', session_id: 's6', set_number: 1, sauna_minutes: 5, cold_bath_seconds: 30, loyly: false, rest_type: 'none' },
    ],
    condition: { id: 'c6', session_id: 's6', sleep_hours: 4, physical_condition: 1, hunger_level: 'normal' },
  },
]

export function getFacilityAvgScore(facilityId: string): number {
  const sessions = mockSessions.filter(s => s.facility_id === facilityId)
  if (sessions.length === 0) return 0
  return sessions.reduce((sum, s) => sum + s.totonoil_score, 0) / sessions.length
}

export function getRecentSessions(count: number): Session[] {
  return [...mockSessions]
    .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
    .slice(0, count)
}

export function getWeeklyScores(): { date: string; score: number }[] {
  const today = new Date('2026-06-04')
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const session = mockSessions.find(s => s.visited_at.startsWith(dateStr))
    result.push({ date: dateStr.slice(5), score: session?.totonoil_score ?? 0 })
  }
  return result
}
