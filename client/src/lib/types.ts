export interface MachineEquivalent {
  name: string
  howToFind?: string
  imagePath?: string
}

export interface Exercise {
  _id: string
  slug: string
  name: string
  muscles: string[]
  equipment: 'barre' | 'haltères' | 'poulie' | 'machine' | 'poids du corps' | 'cardio'
  imagePath?: string
  machineEquivalent?: MachineEquivalent | null
}

export interface ProgramItem {
  exerciseSlug: string
  sets: number
  repsMin?: number
  repsMax?: number
  note?: string
}

export interface ProgramBlock {
  type: 'single' | 'superset' | 'circuit'
  items: ProgramItem[]
}

export interface ProgramDay {
  weekday: number // 0 = dimanche ... 6 = samedi
  title: string
  type: 'muscu' | 'run' | 'repos'
  blocks: ProgramBlock[]
}

export interface Program {
  _id?: string
  name: string
  days: ProgramDay[]
}

export interface SetEntry {
  weight: number
  reps: number
  done: boolean
}

export interface SessionEntry {
  exerciseSlug: string
  exerciseName?: string
  targetSets?: number
  repsMin?: number
  repsMax?: number
  sets: SetEntry[]
}

export interface WorkoutSession {
  _id?: string
  date: string
  weekday: number
  title: string
  entries: SessionEntry[]
  note?: string
}

export type LastPerf = Record<string, { date: string; sets: { weight: number; reps: number }[] }>

export interface ProgressPoint {
  date: string
  maxWeight: number
  totalReps: number
}
