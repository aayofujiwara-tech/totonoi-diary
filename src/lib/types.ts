export type Facility = {
  id: string
  user_id: string
  name: string
  address?: string
  loyly: boolean
  notes?: string
  created_at: string
}

export type Session = {
  id: string
  user_id: string
  facility_id?: string
  visited_at: string
  totonoil_score: number
  memo?: string
  created_at: string
  facility?: Facility
  sets?: Set[]
  condition?: Condition
}

export type Set = {
  id: string
  session_id: string
  set_number: number
  sauna_minutes?: number
  cold_bath_seconds?: number
  loyly: boolean
  rest_type: 'outdoor' | 'indoor' | 'none'
}

export type Condition = {
  id: string
  session_id: string
  sleep_hours?: number
  physical_condition?: number
  hunger_level?: 'hungry' | 'normal' | 'full'
}

export type SetInput = Omit<Set, 'id' | 'session_id'>

export type RecordFormData = {
  facility_id?: string
  facility_name?: string
  visited_at: string
  sets: SetInput[]
  condition: Omit<Condition, 'id' | 'session_id'>
  totonoil_score: number
  memo?: string
}
