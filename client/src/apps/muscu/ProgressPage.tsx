import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartLineUp } from '@phosphor-icons/react'
import { api } from '../../lib/api'
import type { Exercise, ProgressPoint } from '../../lib/types'

export default function ProgressPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [slug, setSlug] = useState('')
  const [points, setPoints] = useState<ProgressPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .exercises()
      .then((exos) => {
        setExercises(exos)
        if (exos.length > 0) setSlug(exos.find((e) => e.slug === 'developpe-couche-barre')?.slug ?? exos[0].slug)
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!slug) return
    setPoints(null)
    api.progress(slug).then(setPoints).catch((e) => setError(e.message))
  }, [slug])

  const data = (points ?? []).map((p) => ({
    ...p,
    label: new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
  }))

  if (error) return <p className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">{error}</p>

  return (
    <div>
      <h2 className="rise mb-5 text-3xl font-bold tracking-tighter text-white" style={{ '--i': 0 } as React.CSSProperties}>
        Progression
      </h2>

      <select
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="rise mb-4 w-full rounded-xl border border-zinc-700/70 bg-zinc-900 p-3.5 text-sm font-medium text-white transition outline-none focus:border-lime-300/70"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        {exercises.map((e) => (
          <option key={e.slug} value={e.slug}>
            {e.name}
          </option>
        ))}
      </select>

      {!points && slug && <div className="skeleton h-72 rounded-2xl" />}

      {points && points.length === 0 && (
        <div className="rise flex flex-col items-center rounded-2xl border border-zinc-800/60 bg-zinc-900/50 px-6 py-12 text-center" style={{ '--i': 2 } as React.CSSProperties}>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400">
            <ChartLineUp size={26} />
          </span>
          <p className="mt-4 font-semibold text-white">Pas encore de données</p>
          <p className="mt-1 max-w-64 text-sm text-zinc-500">
            Valide des séances avec cet exo et ta courbe apparaîtra ici.
          </p>
        </div>
      )}

      {data.length > 0 && (
        <>
          <div className="rise rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-3 pt-6" style={{ '--i': 2 } as React.CSSProperties}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#52525b"
                  fontSize={10}
                  fontFamily="JetBrains Mono Variable, monospace"
                  tickMargin={8}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={10}
                  fontFamily="JetBrains Mono Variable, monospace"
                  unit=" kg"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} kg`, 'Poids max']}
                />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  stroke="#bef264"
                  strokeWidth={2.5}
                  dot={{ fill: '#bef264', strokeWidth: 0, r: 3.5 }}
                  activeDot={{ r: 5.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <ul className="rise mt-5 divide-y divide-zinc-800/60 border-y border-zinc-800/60" style={{ '--i': 3 } as React.CSSProperties}>
            {[...data].reverse().map((p, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-mono text-xs tracking-wide text-zinc-500 uppercase">{p.label}</span>
                <span className="font-mono text-xs text-zinc-400">
                  <span className="text-sm font-semibold text-lime-300">{p.maxWeight} kg</span> max · {p.totalReps}{' '}
                  reps
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
