export interface MachineEquivalent {
  name: string
  howToFind?: string
  imagePath?: string
}

export type Unite = 'reps' | 'secondes' | 'parJambe' | 'parBras' | 'parCote' | 'max'

export interface Exercise {
  _id: string
  slug: string
  name: string
  muscles: string[]
  equipment: 'barre' | 'haltères' | 'poulie' | 'machine' | 'poids du corps' | 'cardio'
  imagePath?: string
  setup?: string
  machineEquivalent?: MachineEquivalent | null
  /** Deux photos départ/arrivée, alternées pour faire un gif. */
  photos?: string[]
  /** Démo filmée (identifiant YouTube). */
  videoId?: string
  /** Famille de mouvement : choisit le dessin affiché sur la carte. */
  pattern?: string
  /** 2 ou 3 repères en français courant. */
  howTo?: string[]
  unit?: Unite
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
  owner?: 'lenny' | 'lysa'
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
