import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  updateDoc,
  deleteDoc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './client'
import type { Facility, Session, SetData, Condition, RecordFormData } from '../types'

// ── ヘルパー ──────────────────────────────────────────────

function toDate(val: unknown): string {
  if (!val) return new Date().toISOString()
  if (val instanceof Timestamp) return val.toDate().toISOString()
  if (typeof val === 'string') return val
  return new Date().toISOString()
}

function docToFacility(id: string, d: DocumentData): Facility {
  return {
    id,
    userId: d.userId,
    name: d.name,
    address: d.address,
    loyly: d.loyly ?? false,
    notes: d.notes,
    createdAt: toDate(d.createdAt),
  }
}

function docToSession(id: string, d: DocumentData): Session {
  return {
    id,
    userId: d.userId,
    facilityId: d.facilityId,
    visitedAt: toDate(d.visitedAt),
    totonoilScore: d.totonoilScore ?? 0,
    memo: d.memo,
    createdAt: toDate(d.createdAt),
  }
}

function docToSetData(id: string, d: DocumentData): SetData {
  return {
    id,
    sessionId: d.sessionId,
    setNumber: d.setNumber,
    saunaMinutes: d.saunaMinutes,
    saunaTemp: d.saunaTemp,
    coldBathSeconds: d.coldBathSeconds,
    coldBathTemp: d.coldBathTemp,
    loyly: d.loyly ?? false,
    restType: d.restType ?? 'none',
  }
}

function docToCondition(id: string, d: DocumentData): Condition {
  return {
    id,
    sessionId: d.sessionId,
    sleepHours: d.sleepHours,
    physicalCondition: d.physicalCondition,
    hungerLevel: d.hungerLevel,
  }
}

// ── Facilities ────────────────────────────────────────────

export async function getFacilities(userId: string): Promise<Facility[]> {
  const q = query(
    collection(db, 'facilities'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => docToFacility(d.id, d.data()))
}

export async function addFacility(
  userId: string,
  data: Omit<Facility, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'facilities'), {
    userId,
    name: data.name,
    address: data.address ?? '',
    loyly: data.loyly,
    notes: data.notes ?? '',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// ── Sessions ──────────────────────────────────────────────

export async function getRecentSessions(userId: string, count = 5): Promise<Session[]> {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    orderBy('visitedAt', 'desc'),
    limit(count)
  )
  const snap = await getDocs(q)
  const sessions = snap.docs.map(d => docToSession(d.id, d.data()))

  // facilityを結合
  const facilityIds = [...new Set(sessions.map(s => s.facilityId).filter(Boolean))] as string[]
  const facilityMap = new Map<string, Facility>()
  await Promise.all(
    facilityIds.map(async fid => {
      const fSnap = await getDoc(doc(db, 'facilities', fid))
      if (fSnap.exists()) facilityMap.set(fid, docToFacility(fSnap.id, fSnap.data()))
    })
  )

  return sessions.map(s => ({
    ...s,
    facility: s.facilityId ? facilityMap.get(s.facilityId) : undefined,
  }))
}

export async function getAllSessionsForDashboard(userId: string): Promise<{
  sessions: Session[]
  sets: SetData[]
  conditions: Condition[]
  facilities: Facility[]
}> {
  // sessions
  const sQ = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    orderBy('visitedAt', 'asc')
  )
  const sSnap = await getDocs(sQ)
  const sessions = sSnap.docs.map(d => docToSession(d.id, d.data()))

  if (sessions.length === 0) {
    return { sessions: [], sets: [], conditions: [], facilities: [] }
  }

  const sessionIds = sessions.map(s => s.id)

  // sets（Firestoreのin制限: 30件まで。個人アプリなので許容）
  const chunks: string[][] = []
  for (let i = 0; i < sessionIds.length; i += 30) chunks.push(sessionIds.slice(i, i + 30))

  const sets: SetData[] = []
  const conditions: Condition[] = []

  await Promise.all(
    chunks.map(async chunk => {
      const [setSnap, condSnap] = await Promise.all([
        getDocs(query(collection(db, 'sets'), where('sessionId', 'in', chunk))),
        getDocs(query(collection(db, 'conditions'), where('sessionId', 'in', chunk))),
      ])
      setSnap.docs.forEach(d => sets.push(docToSetData(d.id, d.data())))
      condSnap.docs.forEach(d => conditions.push(docToCondition(d.id, d.data())))
    })
  )

  // facilities
  const facilityIds = [...new Set(sessions.map(s => s.facilityId).filter(Boolean))] as string[]
  const facilities: Facility[] = []
  await Promise.all(
    facilityIds.map(async fid => {
      const fSnap = await getDoc(doc(db, 'facilities', fid))
      if (fSnap.exists()) facilities.push(docToFacility(fSnap.id, fSnap.data()))
    })
  )

  return { sessions, sets, conditions, facilities }
}

// ── Record保存（セッション + セット + コンディションを一括書き込み）──

export async function saveRecord(userId: string, data: RecordFormData): Promise<string> {
  console.log('[saveRecord] start — userId:', userId, 'score:', data.totonoilScore, 'sets:', data.sets.length)

  let resolvedFacilityId = data.facilityId

  if (data.facilityId === '__new__' && data.facilityName) {
    resolvedFacilityId = await addFacility(userId, {
      name: data.facilityName,
      loyly: false,
    })
    console.log('[saveRecord] new facility created:', resolvedFacilityId)
  }

  const batch = writeBatch(db)

  const sessionRef = doc(collection(db, 'sessions'))
  console.log('[saveRecord] sessionRef.id:', sessionRef.id)

  batch.set(sessionRef, {
    userId,
    facilityId: resolvedFacilityId ?? null,
    visitedAt: data.visitedAt,
    totonoilScore: data.totonoilScore,
    memo: data.memo ?? '',
    createdAt: serverTimestamp(),
  })

  // userId をsets/conditionsにも付与（セキュリティルール評価時にget()不要にするため）
  data.sets.forEach(s => {
    const setRef = doc(collection(db, 'sets'))
    batch.set(setRef, {
      userId,
      sessionId: sessionRef.id,
      setNumber: s.setNumber,
      saunaMinutes: s.saunaMinutes ?? null,
      saunaTemp: s.saunaTemp ?? null,
      coldBathSeconds: s.coldBathSeconds ?? null,
      coldBathTemp: s.coldBathTemp ?? null,
      loyly: s.loyly,
      restType: s.restType,
    })
  })

  const condRef = doc(collection(db, 'conditions'))
  batch.set(condRef, {
    userId,
    sessionId: sessionRef.id,
    sleepHours: data.condition.sleepHours ?? null,
    physicalCondition: data.condition.physicalCondition ?? null,
    hungerLevel: data.condition.hungerLevel ?? null,
  })

  try {
    await batch.commit()
    console.log('[saveRecord] batch committed successfully')
  } catch (err) {
    console.error('[saveRecord] batch.commit failed:', err)
    console.error('[saveRecord] userId was:', userId)
    throw err
  }

  return sessionRef.id
}

// ── Stats ─────────────────────────────────────────────────

export async function getUserStats(userId: string) {
  const sQ = query(collection(db, 'sessions'), where('userId', '==', userId))
  const sSnap = await getDocs(sQ)
  const sessions = sSnap.docs.map(d => d.data())

  if (sessions.length === 0) {
    return { totalSessions: 0, totalSets: 0, avgScore: 0, perfectSessions: 0 }
  }

  const totalSessions = sessions.length
  const avgScore = sessions.reduce((s, d) => s + (d.totonoilScore ?? 0), 0) / totalSessions
  const perfectSessions = sessions.filter(d => d.totonoilScore === 5).length

  const sessionIds = sSnap.docs.map(d => d.id)
  const chunks: string[][] = []
  for (let i = 0; i < sessionIds.length; i += 30) chunks.push(sessionIds.slice(i, i + 30))

  let totalSets = 0
  await Promise.all(
    chunks.map(async chunk => {
      const setSnap = await getDocs(query(collection(db, 'sets'), where('sessionId', 'in', chunk)))
      totalSets += setSnap.size
    })
  )

  return { totalSessions, totalSets, avgScore, perfectSessions }
}

// ── 単一セッション取得（sets・condition・facility込み）──────

export async function getSession(sessionId: string): Promise<Session | null> {
  const sessionSnap = await getDoc(doc(db, 'sessions', sessionId))
  if (!sessionSnap.exists()) return null

  const session = docToSession(sessionSnap.id, sessionSnap.data())

  const [setsSnap, condsSnap] = await Promise.all([
    getDocs(query(collection(db, 'sets'), where('sessionId', '==', sessionId))),
    getDocs(query(collection(db, 'conditions'), where('sessionId', '==', sessionId))),
  ])

  const sets = setsSnap.docs
    .map(d => docToSetData(d.id, d.data()))
    .sort((a, b) => a.setNumber - b.setNumber)

  const condition = condsSnap.docs.length > 0
    ? docToCondition(condsSnap.docs[0].id, condsSnap.docs[0].data())
    : undefined

  let facility: Facility | undefined
  if (session.facilityId) {
    const fSnap = await getDoc(doc(db, 'facilities', session.facilityId))
    if (fSnap.exists()) facility = docToFacility(fSnap.id, fSnap.data())
  }

  return { ...session, sets, condition, facility }
}

// ── 記録更新（session + sets全入れ替え + condition更新）──────

export async function updateRecord(sessionId: string, userId: string, data: RecordFormData): Promise<void> {
  let resolvedFacilityId = data.facilityId
  if (data.facilityId === '__new__' && data.facilityName) {
    resolvedFacilityId = await addFacility(userId, { name: data.facilityName, loyly: false })
  }

  const [existingSetsSnap, existingCondsSnap] = await Promise.all([
    getDocs(query(collection(db, 'sets'), where('sessionId', '==', sessionId))),
    getDocs(query(collection(db, 'conditions'), where('sessionId', '==', sessionId))),
  ])

  const batch = writeBatch(db)

  batch.update(doc(db, 'sessions', sessionId), {
    facilityId: resolvedFacilityId ?? null,
    visitedAt: data.visitedAt,
    totonoilScore: data.totonoilScore,
    memo: data.memo ?? '',
  })

  existingSetsSnap.docs.forEach(d => batch.delete(d.ref))
  data.sets.forEach(s => {
    batch.set(doc(collection(db, 'sets')), {
      userId, sessionId,
      setNumber: s.setNumber,
      saunaMinutes: s.saunaMinutes ?? null,
      saunaTemp: s.saunaTemp ?? null,
      coldBathSeconds: s.coldBathSeconds ?? null,
      coldBathTemp: s.coldBathTemp ?? null,
      loyly: s.loyly,
      restType: s.restType,
    })
  })

  existingCondsSnap.docs.forEach(d => batch.delete(d.ref))
  batch.set(doc(collection(db, 'conditions')), {
    userId, sessionId,
    sleepHours: data.condition.sleepHours ?? null,
    physicalCondition: data.condition.physicalCondition ?? null,
    hungerLevel: data.condition.hungerLevel ?? null,
  })

  await batch.commit()
}

// ── 記録削除（session + sets + conditions）─────────────────

export async function deleteRecord(sessionId: string): Promise<void> {
  const [setsSnap, condsSnap] = await Promise.all([
    getDocs(query(collection(db, 'sets'), where('sessionId', '==', sessionId))),
    getDocs(query(collection(db, 'conditions'), where('sessionId', '==', sessionId))),
  ])

  const batch = writeBatch(db)
  setsSnap.docs.forEach(d => batch.delete(d.ref))
  condsSnap.docs.forEach(d => batch.delete(d.ref))
  batch.delete(doc(db, 'sessions', sessionId))
  await batch.commit()
}
