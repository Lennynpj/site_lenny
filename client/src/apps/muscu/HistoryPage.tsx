import { useEffect, useState } from 'react'
import { ClockCounterClockwise, TrashSimple } from '@phosphor-icons/react'
import { api, formatDate } from '../../lib/api'
import type { WorkoutSession } from '../../lib/types'

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-32 rounded-2xl" />
      <div className="skeleton h-32 rounded-2xl" />
      <div className="skeleton h-32 rounded-2xl" />
    </div>
  )
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.sessions().then(setSessions).catch((e) => setError(e.message))
  }, [])

  async function remove(id: string) {
    if (!confirm('Supprimer cette séance ?')) return
    await api.deleteSession(id)
    setSessions((prev) => prev?.filter((s) => s._id !== id) ?? null)
  }

  if (error) return <p className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">{error}</p>
  if (!sessions) return <HistorySkeleton />

  return (
    <div>
      <h2 className="rise mb-5 text-3xl font-bold tracking-tighter text-white" style={{ '--i': 0 } as React.CSSProperties}>
        Historique
      </h2>

      {sessions.length === 0 && (
        <div className="rise flex flex-col items-center rounded-2xl border border-zinc-800/60 bg-zinc-900/50 px-6 py-12 text-center" style={{ '--i': 1 } as React.CSSProperties}>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400">
            <ClockCounterClockwise size={26} />
          </span>
          <p className="mt-4 font-semibold text-white">Aucune séance pour l'instant</p>
          <p className="mt-1 max-w-64 text-sm text-zinc-500">
            Valide ta première séance depuis l'onglet Séance et elle apparaîtra ici.
          </p>
        </div>
      )}

      <div className="space-y-3 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
        {sessions.map((session, i) => (
          <div
            key={session._id}
            className="rise rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-4"
            style={{ '--i': i + 1 } as React.CSSProperties}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold tracking-tight text-white">{session.title}</h3>
                <p className="mt-0.5 font-mono text-[11px] tracking-wide text-zinc-500 uppercase">
                  {formatDate(session.date)}
                </p>
              </div>
              <button
                onClick={() => session._id && remove(session._id)}
                aria-label="Supprimer la séance"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 transition hover:text-red-400 active:scale-95"
              >
                <TrashSimple size={16} />
              </button>
            </div>

            {session.note && <p className="mt-2 text-sm text-zinc-400 italic">{session.note}</p>}

            {session.entries.length > 0 && (
              <ul className="mt-3 divide-y divide-zinc-800/60">
                {session.entries.map((entry) => {
                  const doneSets = entry.sets.filter((s) => s.done)
                  if (doneSets.length === 0) return null
                  return (
                    <li key={entry.exerciseSlug} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                      <span className="text-zinc-300">{entry.exerciseName ?? entry.exerciseSlug}</span>
                      <span className="shrink-0 text-right font-mono text-xs text-zinc-500">
                        {doneSets.map((s) => `${s.weight}×${s.reps}`).join(' · ')}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
