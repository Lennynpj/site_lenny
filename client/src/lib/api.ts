import type { Exercise, LastPerf, Program, ProgressPoint, WorkoutSession } from './types'

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

export const api = {
  exercises: () => request<Exercise[]>('/exercises'),
  program: () => request<Program>('/program'),
  saveProgram: (program: Program) =>
    request<Program>('/program', { method: 'PUT', body: JSON.stringify(program) }),
  sessions: (limit = 50) => request<WorkoutSession[]>(`/sessions?limit=${limit}`),
  lastPerf: () => request<LastPerf>('/sessions/last-perf'),
  progress: (slug: string) => request<ProgressPoint[]>(`/sessions/progress/${slug}`),
  createSession: (session: WorkoutSession) =>
    request<WorkoutSession>('/sessions', { method: 'POST', body: JSON.stringify(session) }),
  deleteSession: (id: string) => request<void>(`/sessions/${id}`, { method: 'DELETE' }),
}

export const WEEKDAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
export const WEEKDAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
