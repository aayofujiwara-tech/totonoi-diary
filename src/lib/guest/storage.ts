import type { Facility, Session, SetData, Condition, RecordFormData } from '@/lib/types'
import { GUEST_USER_ID, buildDummyData } from './dummyData'

export { GUEST_USER_ID }

const GUEST_MODE_KEY = 'totonoi_guest'
const GUEST_INIT_KEY = 'totonoi_guest_init'
const FACILITIES_KEY = 'totonoi_guest_facilities'
const SESSIONS_KEY = 'totonoi_guest_sessions'
const SETS_KEY = 'totonoi_guest_sets'
const CONDITIONS_KEY = 'totonoi_guest_conditions'

// ── Helpers ───────────────────────────────────────────────

function getAll<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
}
function setAll<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}
function genId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ── Mode Management ───────────────────────────────────────

export function initGuestMode(): void {
  localStorage.setItem(GUEST_MODE_KEY, 'true')
  if (localStorage.getItem(GUEST_INIT_KEY) !== 'true') {
    const data = buildDummyData()
    setAll(FACILITIES_KEY, data.facilities)
    setAll(SESSIONS_KEY, data.sessions)
    setAll(SETS_KEY, data.sets)
    setAll(CONDITIONS_KEY, data.conditions)
    localStorage.setItem(GUEST_INIT_KEY, 'true')
  }
}

export function clearGuestMode(): void {
  ;[GUEST_MODE_KEY, GUEST_INIT_KEY, FACILITIES_KEY, SESSIONS_KEY, SETS_KEY, CONDITIONS_KEY].forEach(
    k => localStorage.removeItem(k)
  )
}

// ── Facilities ────────────────────────────────────────────

export async function guestGetFacilities(): Promise<Facility[]> {
  return getAll<Facility>(FACILITIES_KEY)
}

export async function guestAddFacility(
  data: Omit<Facility, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const id = genId()
  const facility: Facility = { id, userId: GUEST_USER_ID, ...data, createdAt: new Date().toISOString() }
  setAll(FACILITIES_KEY, [facility, ...getAll<Facility>(FACILITIES_KEY)])
  return id
}

export async function guestDeleteFacility(facilityId: string): Promise<void> {
  setAll(FACILITIES_KEY, getAll<Facility>(FACILITIES_KEY).filter(f => f.id !== facilityId))
}

// ── Sessions ──────────────────────────────────────────────

function joinSession(session: Session): Session {
  const facilities = getAll<Facility>(FACILITIES_KEY)
  const sets = getAll<SetData>(SETS_KEY)
    .filter(s => s.sessionId === session.id)
    .sort((a, b) => a.setNumber - b.setNumber)
  const condition = getAll<Condition>(CONDITIONS_KEY).find(c => c.sessionId === session.id)
  const facility = session.facilityId ? facilities.find(f => f.id === session.facilityId) : undefined
  return { ...session, sets, condition, facility }
}

export async function guestGetRecentSessions(count = 5): Promise<Session[]> {
  return getAll<Session>(SESSIONS_KEY)
    .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
    .slice(0, count)
    .map(joinSession)
}

export async function guestGetAllSessionsForDashboard(): Promise<{
  sessions: Session[]
  sets: SetData[]
  conditions: Condition[]
  facilities: Facility[]
}> {
  const sessions = getAll<Session>(SESSIONS_KEY)
    .sort((a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime())
  return {
    sessions,
    sets: getAll<SetData>(SETS_KEY),
    conditions: getAll<Condition>(CONDITIONS_KEY),
    facilities: getAll<Facility>(FACILITIES_KEY),
  }
}

export async function guestGetSession(sessionId: string): Promise<Session | null> {
  const session = getAll<Session>(SESSIONS_KEY).find(s => s.id === sessionId)
  return session ? joinSession(session) : null
}

export async function guestSaveRecord(data: RecordFormData): Promise<string> {
  let facilityId = data.facilityId
  if (data.facilityId === '__new__' && data.facilityName) {
    facilityId = await guestAddFacility({ name: data.facilityName, loyly: false })
  }
  const sessionId = genId()
  const session: Session = {
    id: sessionId, userId: GUEST_USER_ID,
    facilityId: facilityId || undefined,
    visitedAt: new Date(data.visitedAt).toISOString(),
    totonoilScore: data.totonoilScore, memo: data.memo ?? '',
    createdAt: new Date().toISOString(),
  }
  const newSets: SetData[] = data.sets.map(s => ({
    id: genId(), sessionId, setNumber: s.setNumber,
    saunaMinutes: s.saunaMinutes, saunaTemp: s.saunaTemp,
    coldBathSeconds: s.coldBathSeconds, coldBathTemp: s.coldBathTemp,
    loyly: s.loyly, restType: s.restType,
  }))
  const newCond: Condition = {
    id: genId(), sessionId,
    sleepHours: data.condition.sleepHours,
    physicalCondition: data.condition.physicalCondition,
    hungerLevel: data.condition.hungerLevel,
  }
  setAll(SESSIONS_KEY, [...getAll<Session>(SESSIONS_KEY), session])
  setAll(SETS_KEY, [...getAll<SetData>(SETS_KEY), ...newSets])
  setAll(CONDITIONS_KEY, [...getAll<Condition>(CONDITIONS_KEY), newCond])
  return sessionId
}

export async function guestUpdateRecord(sessionId: string, data: RecordFormData): Promise<void> {
  let facilityId = data.facilityId
  if (data.facilityId === '__new__' && data.facilityName) {
    facilityId = await guestAddFacility({ name: data.facilityName, loyly: false })
  }
  setAll(SESSIONS_KEY, getAll<Session>(SESSIONS_KEY).map(s =>
    s.id === sessionId
      ? { ...s, facilityId: facilityId || undefined, visitedAt: new Date(data.visitedAt).toISOString(), totonoilScore: data.totonoilScore, memo: data.memo ?? '' }
      : s
  ))
  setAll(SETS_KEY, [
    ...getAll<SetData>(SETS_KEY).filter(s => s.sessionId !== sessionId),
    ...data.sets.map(s => ({
      id: genId(), sessionId, setNumber: s.setNumber,
      saunaMinutes: s.saunaMinutes, saunaTemp: s.saunaTemp,
      coldBathSeconds: s.coldBathSeconds, coldBathTemp: s.coldBathTemp,
      loyly: s.loyly, restType: s.restType,
    })),
  ])
  setAll(CONDITIONS_KEY, [
    ...getAll<Condition>(CONDITIONS_KEY).filter(c => c.sessionId !== sessionId),
    {
      id: genId(), sessionId,
      sleepHours: data.condition.sleepHours,
      physicalCondition: data.condition.physicalCondition,
      hungerLevel: data.condition.hungerLevel,
    },
  ])
}

export async function guestDeleteRecord(sessionId: string): Promise<void> {
  setAll(SESSIONS_KEY, getAll<Session>(SESSIONS_KEY).filter(s => s.id !== sessionId))
  setAll(SETS_KEY, getAll<SetData>(SETS_KEY).filter(s => s.sessionId !== sessionId))
  setAll(CONDITIONS_KEY, getAll<Condition>(CONDITIONS_KEY).filter(c => c.sessionId !== sessionId))
}

export async function guestGetUserStats() {
  const sessions = getAll<Session>(SESSIONS_KEY)
  const sets = getAll<SetData>(SETS_KEY)
  const totalSessions = sessions.length
  if (totalSessions === 0) return { totalSessions: 0, totalSets: 0, avgScore: 0, perfectSessions: 0 }
  return {
    totalSessions,
    totalSets: sets.length,
    avgScore: sessions.reduce((s, x) => s + x.totonoilScore, 0) / totalSessions,
    perfectSessions: sessions.filter(s => s.totonoilScore === 5).length,
  }
}
