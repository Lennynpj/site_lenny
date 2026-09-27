import type { Exercise, LastPerf, Program, ProgressPoint, WorkoutSession } from './types'

/* Deux personnes utilisent l'app : « owner » dit de qui sont le programme
   et les séances. Absent = Lenny, pour ne rien casser de l'existant. */
type Personne = 'lenny' | 'lysa'

function avecPersonne(path: string, qui?: Personne) {
  if (!qui || qui === 'lenny') return path
  return path + (path.includes('?') ? '&' : '?') + `owner=${qui}`
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Erreur API (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export function apiDe(qui?: Personne) {
  const p = (chemin: string) => avecPersonne(chemin, qui)
  return {
    exercises: () => request<Exercise[]>('/exercises'),
    program: () => request<Program>(p('/program')),
    saveProgram: (program: Program) =>
      request<Program>(p('/program'), { method: 'PUT', body: JSON.stringify(program) }),
    sessions: (limit = 50) => request<WorkoutSession[]>(p(`/sessions?limit=${limit}`)),
    lastPerf: () => request<LastPerf>(p('/sessions/last-perf')),
    progress: (slug: string) => request<ProgressPoint[]>(p(`/sessions/progress/${slug}`)),
    createSession: (session: WorkoutSession) =>
      request<WorkoutSession>(p('/sessions'), { method: 'POST', body: JSON.stringify(session) }),
    deleteSession: (id: string) => request<void>(p(`/sessions/${id}`), { method: 'DELETE' }),
  }
}

export const api = apiDe('lenny')
export const apiLysa = apiDe('lysa')

export const WEEKDAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
export const WEEKDAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
