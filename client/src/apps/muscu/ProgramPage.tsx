import { useEffect, useState } from 'react'
import { Check, PencilSimple, TrashSimple } from '@phosphor-icons/react'
import { api, WEEKDAYS } from '../../lib/api'
import type { Exercise, Program, ProgramItem } from '../../lib/types'

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

function ProgramSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-52 rounded-2xl" />
      <div className="skeleton h-52 rounded-2xl" />
    </div>
  )
}

export default function ProgramPage() {
  const [program, setProgram] = useState<Program | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.program(), api.exercises()])
      .then(([prog, exos]) => {
        setProgram(prog)
        setExercises(exos)
      })
      .catch((e) => setError(e.message))
  }, [])

  const exoName = (slug: string) => exercises.find((e) => e.slug === slug)?.name ?? slug

  function updateItem(dayIdx: number, blockIdx: number, itemIdx: number, patch: Partial<ProgramItem>) {
    setProgram((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      Object.assign(next.days[dayIdx].blocks[blockIdx].items[itemIdx], patch)
      return next
    })
  }

  function removeItem(dayIdx: number, blockIdx: number, itemIdx: number) {
    setProgram((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      const block = next.days[dayIdx].blocks[blockIdx]
      block.items.splice(itemIdx, 1)
      if (block.items.length === 0) next.days[dayIdx].blocks.splice(blockIdx, 1)
      return next
    })
  }

  function addExercise(dayIdx: number, slug: string) {
    if (!slug) return
    setProgram((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      next.days[dayIdx].blocks.push({
        type: 'single',
        items: [{ exerciseSlug: slug, sets: 3, repsMin: 10, repsMax: 12 }],
      })
      return next
    })
  }

  async function save() {
    if (!program) return
    setSaving(true)
    setError(null)
    try {
      const saved = await api.saveProgram(program)
      setProgram(saved)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  if (error && !program)
    return <p className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">{error}</p>
  if (!program) return <ProgramSkeleton />

  return (
    <div>
      <div className="rise mb-5 flex items-end justify-between gap-3" style={{ '--i': 0 } as React.CSSProperties}>
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">Programme</h2>
          <p className="mt-1 text-sm text-zinc-500">{program.name}</p>
        </div>
        {editing ? (
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-lime-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition active:scale-95 disabled:opacity-50"
          >
            <Check size={15} weight="bold" />
            {saving ? '…' : 'Enregistrer'}
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 active:scale-95"
          >
            <PencilSimple size={15} />
            Modifier
          </button>
        )}
      </div>

      {error && (
        <p className="mb-3 rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>
      )}

      <div className="space-y-3">
        {WEEK_ORDER.map((wd, order) => {
          const dayIdx = program.days.findIndex((d) => d.weekday === wd)
          if (dayIdx === -1) return null
          const day = program.days[dayIdx]
          return (
            <div
              key={wd}
              className="rise rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-4"
              style={{ '--i': order + 1 } as React.CSSProperties}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold tracking-tight text-white">{WEEKDAYS[day.weekday]}</h3>
                <span
                  className={`text-sm font-medium ${
                    day.type === 'repos' ? 'text-zinc-600' : day.type === 'run' ? 'text-sky-300' : 'text-lime-300'
                  }`}
                >
                  {day.title}
                </span>
              </div>

              {day.blocks.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {day.blocks.map((block, blockIdx) => (
                    <li
                      key={blockIdx}
                      className={
                        block.type !== 'single' ? 'rounded-xl border-l-2 border-lime-300/60 bg-zinc-800/30 p-2.5' : ''
                      }
                    >
                      {block.type !== 'single' && (
                        <p className="mb-1.5 font-mono text-[10px] font-semibold tracking-[0.2em] text-lime-300/80 uppercase">
                          {block.type === 'superset' ? 'Superset' : 'Circuit'}
                        </p>
                      )}
                      {block.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center justify-between gap-2 py-1">
                          <span className="min-w-0 text-sm text-zinc-300">{exoName(item.exerciseSlug)}</span>
                          {editing ? (
                            <span className="flex shrink-0 items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                value={item.sets}
                                onChange={(e) => updateItem(dayIdx, blockIdx, itemIdx, { sets: Number(e.target.value) })}
                                className="h-8 w-11 rounded-md border border-zinc-700 bg-zinc-800 text-center font-mono text-xs text-white outline-none focus:border-lime-300/70"
                              />
                              <span className="font-mono text-xs text-zinc-600">×</span>
                              <input
                                type="number"
                                min={1}
                                value={item.repsMin ?? ''}
                                onChange={(e) => updateItem(dayIdx, blockIdx, itemIdx, { repsMin: Number(e.target.value) })}
                                className="h-8 w-11 rounded-md border border-zinc-700 bg-zinc-800 text-center font-mono text-xs text-white outline-none focus:border-lime-300/70"
                              />
                              <span className="font-mono text-xs text-zinc-600">-</span>
                              <input
                                type="number"
                                min={1}
                                value={item.repsMax ?? ''}
                                onChange={(e) => updateItem(dayIdx, blockIdx, itemIdx, { repsMax: Number(e.target.value) })}
                                className="h-8 w-11 rounded-md border border-zinc-700 bg-zinc-800 text-center font-mono text-xs text-white outline-none focus:border-lime-300/70"
                              />
                              <button
                                onClick={() => removeItem(dayIdx, blockIdx, itemIdx)}
                                aria-label="Supprimer l'exercice"
                                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:text-red-400 active:scale-95"
                              >
                                <TrashSimple size={15} />
                              </button>
                            </span>
                          ) : (
                            <span className="shrink-0 font-mono text-xs text-zinc-500">
                              {item.sets}
                              {item.repsMin
                                ? ` × ${item.repsMin}${item.repsMax && item.repsMax !== item.repsMin ? `-${item.repsMax}` : ''}`
                                : ''}
                            </span>
                          )}
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              )}

              {editing && day.type === 'muscu' && (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    addExercise(dayIdx, e.target.value)
                    e.target.value = ''
                  }}
                  className="mt-3 w-full rounded-xl border border-dashed border-zinc-700 bg-transparent p-2.5 text-sm text-zinc-500 outline-none"
                >
                  <option value="" disabled>
                    + Ajouter un exercice…
                  </option>
                  {exercises.map((e) => (
                    <option key={e.slug} value={e.slug}>
                      {e.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
