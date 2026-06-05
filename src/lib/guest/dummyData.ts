import type { Facility, Session, SetData, Condition } from '@/lib/types'

export const GUEST_USER_ID = 'guest'

function daysAgo(n: number, hour = 18): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

const FACILITIES: Facility[] = [
  {
    id: 'guest_fac_01', userId: GUEST_USER_ID,
    name: 'スパワールド', address: '大阪府大阪市浪速区恵美須東3-4-24',
    loyly: true, notes: 'スチームサウナが充実', createdAt: daysAgo(20),
  },
  {
    id: 'guest_fac_02', userId: GUEST_USER_ID,
    name: 'サウナしきじ', address: '静岡県静岡市駿河区敷地2-25-1',
    loyly: true, notes: '天然水の水風呂が絶品', createdAt: daysAgo(20),
  },
  {
    id: 'guest_fac_03', userId: GUEST_USER_ID,
    name: 'テルマー湯', address: '東京都新宿区新宿3-34-11',
    loyly: false, notes: '都会のオアシス', createdAt: daysAgo(20),
  },
]

type Spec = {
  id: string
  facilityId: string
  daysBack: number
  score: number
  sleep: number
  physical: number
  hunger: 'hungry' | 'normal' | 'full'
  numSets: number
  coldBath: number
  saunaMin: number
  loyly: boolean
}

const SPECS: Spec[] = [
  { id: 'guest_ses_01', facilityId: 'guest_fac_01', daysBack: 13, score: 2, sleep: 6,   physical: 3, hunger: 'hungry', numSets: 2, coldBath: 60,  saunaMin: 8,  loyly: true  },
  { id: 'guest_ses_02', facilityId: 'guest_fac_02', daysBack: 11, score: 5, sleep: 8,   physical: 5, hunger: 'normal', numSets: 3, coldBath: 120, saunaMin: 12, loyly: true  },
  { id: 'guest_ses_03', facilityId: 'guest_fac_03', daysBack: 9,  score: 2, sleep: 6.5, physical: 3, hunger: 'full',   numSets: 2, coldBath: 70,  saunaMin: 9,  loyly: false },
  { id: 'guest_ses_04', facilityId: 'guest_fac_01', daysBack: 8,  score: 3, sleep: 7,   physical: 4, hunger: 'normal', numSets: 2, coldBath: 90,  saunaMin: 10, loyly: true  },
  { id: 'guest_ses_05', facilityId: 'guest_fac_02', daysBack: 6,  score: 4, sleep: 7.5, physical: 4, hunger: 'normal', numSets: 3, coldBath: 100, saunaMin: 11, loyly: true  },
  { id: 'guest_ses_06', facilityId: 'guest_fac_03', daysBack: 4,  score: 2, sleep: 6,   physical: 3, hunger: 'hungry', numSets: 2, coldBath: 65,  saunaMin: 8,  loyly: false },
  { id: 'guest_ses_07', facilityId: 'guest_fac_01', daysBack: 3,  score: 5, sleep: 8,   physical: 5, hunger: 'normal', numSets: 3, coldBath: 120, saunaMin: 12, loyly: true  },
  { id: 'guest_ses_08', facilityId: 'guest_fac_02', daysBack: 2,  score: 4, sleep: 7,   physical: 4, hunger: 'full',   numSets: 2, coldBath: 90,  saunaMin: 10, loyly: true  },
  { id: 'guest_ses_09', facilityId: 'guest_fac_03', daysBack: 1,  score: 4, sleep: 8,   physical: 4, hunger: 'normal', numSets: 3, coldBath: 110, saunaMin: 11, loyly: false },
]

export function buildDummyData(): {
  facilities: Facility[]
  sessions: Session[]
  sets: SetData[]
  conditions: Condition[]
} {
  const sessions: Session[] = []
  const sets: SetData[] = []
  const conditions: Condition[] = []

  SPECS.forEach(spec => {
    const visitedAt = daysAgo(spec.daysBack)
    sessions.push({
      id: spec.id, userId: GUEST_USER_ID,
      facilityId: spec.facilityId,
      visitedAt, totonoilScore: spec.score, memo: '', createdAt: visitedAt,
    })
    for (let i = 1; i <= spec.numSets; i++) {
      sets.push({
        id: `${spec.id}_set_${i}`, sessionId: spec.id, setNumber: i,
        saunaMinutes: spec.saunaMin, saunaTemp: 90,
        coldBathSeconds: spec.coldBath, coldBathTemp: 16,
        loyly: spec.loyly && i === 1, restType: 'outdoor',
      })
    }
    conditions.push({
      id: `${spec.id}_cond`, sessionId: spec.id,
      sleepHours: spec.sleep, physicalCondition: spec.physical, hungerLevel: spec.hunger,
    })
  })

  return { facilities: FACILITIES, sessions, sets, conditions }
}
