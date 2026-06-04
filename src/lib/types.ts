export type Facility = {
  id: string
  userId: string
  name: string
  address?: string
  loyly: boolean
  notes?: string
  createdAt: string
}

export type Session = {
  id: string
  userId: string
  facilityId?: string
  visitedAt: string
  totonoilScore: number
  memo?: string
  createdAt: string
  facility?: Facility
  sets?: SetData[]
  condition?: Condition
}

export type SetData = {
  id: string
  sessionId: string
  setNumber: number
  saunaMinutes?: number
  coldBathSeconds?: number
  loyly: boolean
  restType: 'outdoor' | 'indoor' | 'none'
}

export type Condition = {
  id: string
  sessionId: string
  sleepHours?: number
  physicalCondition?: number
  hungerLevel?: 'hungry' | 'normal' | 'full'
}

export type SetFormItem = Omit<SetData, 'id' | 'sessionId'>

export type RecordFormData = {
  facilityId?: string
  facilityName?: string
  visitedAt: string
  sets: SetFormItem[]
  condition: Omit<Condition, 'id' | 'sessionId'>
  totonoilScore: number
  memo?: string
}
