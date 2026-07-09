import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, MoonStars, PersonSimpleRun, Timer, X } from '@phosphor-icons/react'
import { api, WEEKDAYS, WEEKDAYS_SHORT } from '../../lib/api'
import type { Exercise, LastPerf, Program, SetEntry, WorkoutSession } from '../../lib/types'
import ExerciseCard from './components/ExerciseCard'

// Ordre d'affichage lundi → dimanche
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
// Durée du repos entre les séries (démarre à chaque série validée)
const REST_SECONDS = 90

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function TodaySkeleton() {
  return (
    <div>
      <div className="mb-5 flex gap-1.5">
        {WEEK_ORDER.map((i) => (
          <div key={i} className="skeleton h-9 w-13 rounded-full" />
        ))}
      </div>
      <div className="skeleton mb-2 h-8 w-2/3" />
      <div className="skeleton mb-6 h-4 w-1/3" />
      <div className="space-y-4">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export default function TodayPage() {
  const navigate = useNavigate()
  const [program, setProgram] = useState<Program | null>(null)
  const [exercises, setExercises] = useState<Record<string, Exercise>>({})
  const [lastPerf, setLastPerf] = useState<LastPerf>({})
  const [weekday, setWeekday] = useState(new Date().getDay())
  const [entries, setEntries] = useState<Record<string, SetEntry[]>>({})
  const [runNote, setRunNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Minuteur de repos
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    Promise.all([api.program(), api.exercises(), api.lastPerf()])
      .then(([prog, exos, perf]) => {
        setProgram(prog)
        setExercises(Object.fromEntries(exos.map((e) => [e.slug, e])))
        setLastPerf(perf)
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!restEndsAt) return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [restEndsAt])

  const restLeft = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0

  useEffect(() => {
    if (restEndsAt && restLeft === 0) setRestEndsAt(null)
  }, [restLeft, restEndsAt])

  const day = useMemo(() => program?.days.find((d) => d.weekday === weekday), [program, weekday])

  // (Ré)initialise la saisie quand on change de jour : poids pré-rempli avec la dernière perf
  useEffect(() => {
    if (!day) return
    const next: Record<string, SetEntry[]> = {}
    for (const block of day.blocks) {
      for (const item of block.items) {
        const perf = lastPerf[item.exerciseSlug]
        next[item.exerciseSlug] = Array.from({ length: item.sets }, (_, i) => ({
          weight: perf?.sets[i]?.weight ?? perf?.sets.at(-1)?.weight ?? 0,
          reps: 0,
          done: false,
        }))
      }
    }
    setEntries(next)
    setSaved(false)
    setRestEndsAt(null)
  }, [day, lastPerf])

  function updateSet(slug: string, setIndex: number, patch: Partial<SetEntry>) {
    setEntries((prev) => ({
      ...prev,
      [slug]: prev[slug].map((s, i) => (i === setIndex ? { ...s, ...patch } : s)),
    }))
    // Série validée → le repos démarre
    if (patch.done === true) {
      setNow(Date.now())
      setRestEndsAt(Date.now() + REST_SECONDS * 1000)
    }
  }

  const allSets = Object.values(entries).flat()
  const doneCount = allSets.filter((s) => s.done).length
  const totalSets = allSets.length

  async function validateSession() {
    if (!day) return
    setSaving(true)
    setError(null)
    try {
      const session: WorkoutSession = {
        date: new Date().toISOString(),
        weekday: day.weekday,
        title: day.title,
        note: day.type === 'run' ? runNote : undefined,
        entries:
          day.type === 'run'
            ? []
            : day.blocks.flatMap((block) =>
                block.items.map((item) => ({
                  exerciseSlug: item.exerciseSlug,
                  exerciseName: exercises[item.exerciseSlug]?.name,
                  targetSets: item.sets,
                  repsMin: item.repsMin,
                  repsMax: item.repsMax,
                  sets: entries[item.exerciseSlug] ?? [],
                }))
              ),
      }
      await api.createSession(session)
      setSaved(true)
      setRestEndsAt(null)
      setTimeout(() => navigate('/muscu/historique'), 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  if (error && !program) {
    return <p className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">{error}</p>
  }
  if (!program || !day) return <TodaySkeleton />

  return (
    <div>
      {/* Sélecteur de jour */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {WEEK_ORDER.map((wd) => {
          const isToday = wd === new Date().getDay()
          const active = wd === weekday
          return (
            <button
              key={wd}
              onClick={() => setWeekday(wd)}
              className={`relative shrink-0 rounded-full px-4 py-2 font-mono text-xs font-medium tracking-wide uppercase transition duration-200 active:scale-95 ${
                active
                  ? 'bg-lime-300 text-zinc-950'
                  : 'border border-zinc-800 bg-zinc-900/70 text-zinc-500 hover:text-zinc-200'
              }`}
            >
              {WEEKDAYS_SHORT[wd]}
              {isToday && !active && (
                <span className="pulse-dot absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-lime-300" />
              )}
            </button>
          )
        })}
      </div>

      <div className="rise mb-5" style={{ '--i': 0 } as React.CSSProperties}>
        <p className="font-mono text-[11px] tracking-[0.25em] text-zinc-600 uppercase">
          {WEEKDAYS[day.weekday]}
          {day.weekday === new Date().getDay() && ' · séance du jour'}
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tighter text-white">{day.title}</h2>
        {day.type === 'muscu' && totalSets > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-lime-300 transition-all duration-500 ease-out"
                style={{ width: `${(doneCount / totalSets) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-zinc-500">
              <span className="text-zinc-200">{doneCount}</span>/{totalSets}
            </span>
          </div>
        )}
      </div>

      {day.type === 'repos' && (
        <div
          className="rise flex flex-col items-center rounded-2xl border border-zinc-800/60 bg-zinc-900/50 px-6 py-12 text-center"
          style={{ '--i': 1 } as React.CSSProperties}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400">
            <MoonStars size={26} />
          </span>
          <p className="mt-4 font-semibold text-white">Repos aujourd'hui</p>
          <p className="mt-1 max-w-60 text-sm text-zinc-500">
            Récupère bien, la progression se fait aussi là.
          </p>
        </div>
      )}

      {day.type === 'run' && (
        <div
          className="rise rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5"
          style={{ '--i': 1 } as React.CSSProperties}
        >
          <div className="flex flex-col items-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-400/10 text-sky-300">
              <PersonSimpleRun size={26} />
            </span>
            <p className="mt-3 font-semibold text-white">Jour de run</p>
          </div>
          <textarea
            value={runNote}
            onChange={(e) => setRunNote(e.target.value)}
            placeholder="Distance, temps, ressenti… (optionnel)"
            rows={3}
            className="mt-5 w-full rounded-xl border border-zinc-700/70 bg-zinc-800/70 p-3.5 text-sm text-white transition outline-none placeholder:text-zinc-600 focus:border-lime-300/70"
          />
          <button
            onClick={validateSession}
            disabled={saving || saved}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 py-3.5 font-semibold text-zinc-950 transition duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            {saved && <Check size={18} weight="bold" />}
            {saved ? 'Run enregistré' : saving ? 'Enregistrement…' : 'Valider le run'}
          </button>
        </div>
      )}

      {day.type === 'muscu' && (
        <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
          {day.blocks.map((block, bi) => {
            const cards = block.items.map((item) => {
              const exercise = exercises[item.exerciseSlug]
              if (!exercise) return null
              return (
                <ExerciseCard
                  key={item.exerciseSlug}
                  exercise={exercise}
                  item={item}
                  sets={entries[item.exerciseSlug] ?? []}
                  lastPerf={lastPerf[item.exerciseSlug]}
                  onSetChange={(i, patch) => updateSet(item.exerciseSlug, i, patch)}
                />
              )
            })
            const style = { '--i': bi + 1 } as React.CSSProperties
            if (block.type === 'single')
              return (
                <div key={bi} className="rise" style={style}>
                  {cards}
                </div>
              )
            return (
              <div
                key={bi}
                className="rise rounded-2xl border-l-2 border-lime-300/70 bg-zinc-900/30 p-2"
                style={style}
              >
                <p className="px-2 pt-1.5 pb-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-lime-300 uppercase">
                  {block.type === 'superset' ? 'Superset · enchaîne sans pause' : 'Circuit'}
                </p>
                <div className="space-y-2">{cards}</div>
              </div>
            )
          })}

          {error && (
            <p className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>
          )}
        </div>
      )}

      {/* Barre de session : progression + minuteur de repos + validation */}
      {day.type === 'muscu' && doneCount > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-20">
          <div className="mx-auto max-w-xl px-4">
            <div className="rise flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/85 p-2 pl-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {restLeft > 0 ? (
                <button
                  onClick={() => setRestEndsAt(null)}
                  className="flex items-center gap-2 transition active:scale-95"
                  aria-label="Arrêter le repos"
                >
                  <Timer size={17} weight="fill" className="pulse-dot text-lime-300" />
                  <span className="font-mono text-[15px] font-medium text-lime-300">{formatTime(restLeft)}</span>
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">repos</span>
                  <X size={12} className="text-zinc-600" />
                </button>
              ) : (
                <p className="font-mono text-[15px] text-zinc-200">
                  {doneCount}
                  <span className="text-zinc-600">/{totalSets}</span>
                  <span className="ml-2 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">séries</span>
                </p>
              )}
              <button
                onClick={validateSession}
                disabled={saving || saved}
                className="ml-auto flex items-center gap-1.5 rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition duration-200 active:scale-[0.97] disabled:opacity-60"
              >
                <Check size={16} weight="bold" />
                {saved ? 'Enregistrée' : saving ? '…' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
