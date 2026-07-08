import { useState } from 'react'
import { CaretDown, Check, MapPin } from '@phosphor-icons/react'
import type { Exercise, LastPerf, ProgramItem, SetEntry } from '../../../lib/types'

interface Props {
  exercise: Exercise
  item: ProgramItem
  sets: SetEntry[]
  lastPerf: LastPerf[string] | undefined
  onSetChange: (setIndex: number, patch: Partial<SetEntry>) => void
}

function targetLabel(item: ProgramItem) {
  if (!item.repsMin) return `${item.sets} série${item.sets > 1 ? 's' : ''}`
  const reps = item.repsMax && item.repsMax !== item.repsMin ? `${item.repsMin}-${item.repsMax}` : `${item.repsMin}`
  return `${item.sets} × ${reps}`
}

export default function ExerciseCard({ exercise, item, sets, lastPerf, onSetChange }: Props) {
  const [showFind, setShowFind] = useState(false)
  const machine = exercise.machineEquivalent
  const isOwnPhoto = exercise.imagePath?.includes('/perso/') ?? false
  const allDone = sets.length > 0 && sets.every((s) => s.done)

  return (
    <div
      className={`rounded-2xl border bg-zinc-900/70 p-4 transition-colors duration-500 ${
        allDone ? 'border-lime-300/40' : 'border-zinc-800/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {allDone && (
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-300 text-zinc-950">
              <Check size={12} weight="bold" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-[17px] font-semibold tracking-tight text-white">{exercise.name}</h3>
            {item.note && <p className="mt-0.5 text-xs text-amber-300/80">{item.note}</p>}
          </div>
        </div>
        <span className="shrink-0 rounded-md border border-zinc-700/60 bg-zinc-800/80 px-2 py-1 font-mono text-xs font-medium text-lime-300">
          {targetLabel(item)}
        </span>
      </div>

      {lastPerf && (
        <p className="mt-2 text-xs text-zinc-500">
          Dernière fois{' '}
          <span className="ml-1 font-mono text-zinc-300">
            {lastPerf.sets.map((s) => `${s.weight}kg×${s.reps}`).join(' · ')}
          </span>
        </p>
      )}

      {/* Photos : soit l'exo + son équivalent machine, soit une seule photo si l'exo EST déjà une machine */}
      {machine ? (
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <figure className="min-w-0">
            <img
              src={exercise.imagePath}
              alt={exercise.name}
              loading="lazy"
              className="h-36 w-full rounded-xl border border-white/10 bg-white object-contain"
            />
            <figcaption className="mt-1.5 font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
              L'exo
            </figcaption>
          </figure>
          <figure className="min-w-0">
            <img
              src={machine.imagePath}
              alt={machine.name}
              loading="lazy"
              className="h-36 w-full rounded-xl border border-white/10 bg-white object-contain"
            />
            <figcaption className="mt-1.5 flex items-start gap-1 text-[11px] leading-snug font-medium text-lime-300">
              <MapPin size={12} weight="fill" className="mt-0.5 shrink-0" />
              {machine.name}
            </figcaption>
          </figure>
        </div>
      ) : (
        <figure className="mt-3.5">
          <img
            src={exercise.imagePath}
            alt={exercise.name}
            loading="lazy"
            className="h-56 w-full rounded-xl border border-white/10 bg-white object-contain"
          />
          {isOwnPhoto && (
            <figcaption className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-lime-300">
              <MapPin size={12} weight="fill" className="shrink-0" />
              Ta machine
            </figcaption>
          )}
        </figure>
      )}

      {machine?.howToFind && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setShowFind((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            Comment la trouver
            <CaretDown
              size={12}
              className={`transition-transform duration-300 ${showFind ? 'rotate-180' : ''}`}
            />
          </button>
          <div
            className={`grid transition-all duration-300 ease-out ${
              showFind ? 'mt-1.5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <p className="overflow-hidden text-xs leading-relaxed text-zinc-400">{machine.howToFind}</p>
          </div>
        </div>
      )}

      {/* Saisie des séries — une ligne par série, se remplit en lime une fois validée */}
      <div className="mt-4 space-y-2">
        {sets.map((set, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-xl border p-2 transition-colors duration-200 ${
              set.done ? 'border-lime-300/40 bg-lime-300/[0.07]' : 'border-zinc-800 bg-zinc-800/25'
            }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold transition-colors ${
                set.done ? 'bg-lime-300/20 text-lime-300' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {i + 1}
            </span>

            <label className="relative min-w-0 flex-1">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={set.weight || ''}
                placeholder="0"
                onChange={(e) => onSetChange(i, { weight: Number(e.target.value) })}
                className="h-12 w-full min-w-0 rounded-lg border border-transparent bg-zinc-900/70 pr-7 pl-3 font-mono text-lg text-white tabular-nums outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60"
              />
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 font-mono text-[11px] text-zinc-500">
                kg
              </span>
            </label>

            <span className="font-mono text-sm text-zinc-600">×</span>

            <label className="relative min-w-0 flex-1">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={set.reps || ''}
                placeholder="0"
                onChange={(e) => onSetChange(i, { reps: Number(e.target.value) })}
                className="h-12 w-full min-w-0 rounded-lg border border-transparent bg-zinc-900/70 pr-9 pl-3 font-mono text-lg text-white tabular-nums outline-none transition placeholder:text-zinc-600 focus:border-lime-300/60"
              />
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 font-mono text-[11px] text-zinc-500">
                reps
              </span>
            </label>

            <button
              type="button"
              onClick={() => onSetChange(i, { done: !set.done })}
              aria-label={`Valider la série ${i + 1}`}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg transition duration-200 active:scale-95 ${
                set.done
                  ? 'bg-lime-300 text-zinc-950'
                  : 'border border-zinc-700 bg-zinc-900/70 text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <Check size={20} weight="bold" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
