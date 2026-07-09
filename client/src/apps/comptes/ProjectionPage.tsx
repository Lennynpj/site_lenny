import { useCallback, useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Check, Plus, TrashSimple } from '@phosphor-icons/react'
import { comptesApi, formatEuro } from '../../lib/comptes'
import type { Projection, SimEvent } from '../../lib/comptes'
import { ErrorBox, Field, MoneyInput, PrimaryButton, Select, Sheet, TextInput } from './components/ui'

const HORIZONS = [
  { label: '12 mois', value: 12 },
  { label: '2 ans', value: 24 },
  { label: '5 ans', value: 60 },
]

export default function ProjectionPage() {
  const [horizon, setHorizon] = useState(24)
  const [events, setEvents] = useState<SimEvent[]>([])
  const [proj, setProj] = useState<Projection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const load = useCallback(() => {
    setProj(null)
    comptesApi.projection(horizon, events.length ? events : undefined).then(setProj).catch((e) => setError(e.message))
  }, [horizon, events])

  useEffect(() => load(), [load])

  if (error) return <ErrorBox message={error} />

  // Fusionne baseline + simulé pour le graphe
  const data =
    proj?.baseline.map((p, idx) => ({
      month: p.month,
      label: p.month === 0 ? 'Auj.' : `${p.month}m`,
      actuel: p.patrimoine,
      simule: proj.simule ? proj.simule[idx].patrimoine : undefined,
    })) ?? []

  const last = proj?.baseline.at(-1)
  const lastSim = proj?.simule?.at(-1)
  const gain = last ? last.patrimoine - (proj?.baseline[0].patrimoine ?? 0) : 0

  return (
    <div>
      <div className="rise mb-4" style={{ '--i': 0 } as React.CSSProperties}>
        <h2 className="text-3xl font-bold tracking-tighter text-white">Projection</h2>
        <p className="mt-1 text-sm text-zinc-500">Ton patrimoine si tout continue comme aujourd'hui.</p>
      </div>

      {/* Sélecteur d'horizon */}
      <div className="rise mb-4 flex gap-1.5" style={{ '--i': 1 } as React.CSSProperties}>
        {HORIZONS.map((h) => (
          <button
            key={h.value}
            onClick={() => setHorizon(h.value)}
            className={`flex-1 rounded-full py-2 font-mono text-xs font-medium transition active:scale-95 ${
              horizon === h.value ? 'bg-emerald-400 text-zinc-950' : 'border border-zinc-800 bg-zinc-900/70 text-zinc-400'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      {!proj ? (
        <div className="skeleton h-72 rounded-2xl" />
      ) : (
        <>
          {/* Chiffres clés */}
          <div className="rise mb-3 grid grid-cols-2 gap-3" style={{ '--i': 2 } as React.CSSProperties}>
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-4">
              <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">Dans {horizon} mois</p>
              <p className="mt-1 text-xl font-bold text-white">{formatEuro(last?.patrimoine ?? 0, false)}</p>
              <p className={`font-mono text-xs ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {gain >= 0 ? '+' : ''}
                {formatEuro(gain, false)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-4">
              <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">Épargne / mois</p>
              <p className="mt-1 text-xl font-bold text-white">{formatEuro(proj.monthlyNetToCurrent, false)}</p>
              <p className="font-mono text-xs text-zinc-500">après charges & conso</p>
            </div>
          </div>

          {/* Graphe */}
          <div className="rise rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-3 pt-5" style={{ '--i': 3 } as React.CSSProperties}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono Variable, monospace" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono Variable, monospace" tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 10, fontSize: 12 }}
                  formatter={(v, n) => [formatEuro(Number(v), false), n === 'simule' ? 'Simulé' : 'Actuel']}
                  labelFormatter={(l) => (l === 'Auj.' ? "Aujourd'hui" : `Dans ${String(l).replace('m', '')} mois`)}
                />
                {proj.simule && <Legend wrapperStyle={{ fontSize: 11 }} />}
                <Area type="monotone" dataKey="actuel" name="Actuel" stroke="#34d399" strokeWidth={2.5} fill="url(#grad)" />
                {proj.simule && (
                  <Line type="monotone" dataKey="simule" name="Simulé" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 4" dot={false} />
                )}
              </AreaChart>
            </ResponsiveContainer>
            {proj.simule && lastSim && last && (
              <p className="px-2 pt-2 text-center font-mono text-xs text-amber-300/90">
                Impact simulé dans {horizon} mois : {lastSim.patrimoine - last.patrimoine >= 0 ? '+' : ''}
                {formatEuro(lastSim.patrimoine - last.patrimoine, false)}
              </p>
            )}
          </div>

          {/* Simulateur */}
          <section className="rise mt-6" style={{ '--i': 4 } as React.CSSProperties}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300">Simuler un changement</h2>
              <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200">
                <Plus size={13} weight="bold" /> Ajouter
              </button>
            </div>
            {events.length === 0 ? (
              <p className="rounded-xl bg-zinc-900/60 p-4 text-sm text-zinc-500">
                Ajoute une dépense ou un revenu futur (ex. « −200 €/mois dans 6 mois ») pour voir l'effet sur la courbe.
              </p>
            ) : (
              <ul className="space-y-2">
                {events.map((e, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3.5 py-2.5">
                    <span className="flex-1 text-sm text-zinc-200">{e.label || (e.kind === 'revenu' ? 'Revenu' : 'Dépense')}</span>
                    <span className={`font-mono text-sm ${e.kind === 'revenu' ? 'text-emerald-300' : 'text-red-300'}`}>
                      {e.kind === 'revenu' ? '+' : '−'}
                      {formatEuro(e.amount, false)}
                      {e.recurring ? '/m' : ''}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">dès M{e.startMonth}</span>
                    <button onClick={() => setEvents(events.filter((_, j) => j !== i))} aria-label="Retirer" className="text-zinc-600 hover:text-red-400">
                      <TrashSimple size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {addOpen && (
        <EventForm
          maxMonth={horizon}
          onClose={() => setAddOpen(false)}
          onAdd={(ev) => {
            setEvents((prev) => [...prev, ev])
            setAddOpen(false)
          }}
        />
      )}
    </div>
  )
}

function EventForm({ maxMonth, onClose, onAdd }: { maxMonth: number; onClose: () => void; onAdd: (e: SimEvent) => void }) {
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [kind, setKind] = useState<'depense' | 'revenu'>('depense')
  const [startMonth, setStartMonth] = useState<number>(1)
  const [recurring, setRecurring] = useState(true)

  return (
    <Sheet open onClose={onClose} title="Événement à simuler">
      <div className="space-y-4">
        <Field label="Libellé (optionnel)">
          <TextInput value={label} placeholder="Ex. Nouvelle voiture" onChange={(e) => setLabel(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Montant">
            <MoneyInput value={amount || ''} onChange={setAmount} autoFocus />
          </Field>
          <Field label="Type">
            <Select value={kind} onChange={(e) => setKind(e.target.value as 'depense' | 'revenu')}>
              <option value="depense">Dépense</option>
              <option value="revenu">Revenu</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`À partir du mois (0-${maxMonth})`}>
            <TextInput
              type="number"
              min={0}
              max={maxMonth}
              value={startMonth}
              onChange={(e) => setStartMonth(Math.min(maxMonth, Math.max(0, Number(e.target.value))))}
            />
          </Field>
          <Field label="Récurrence">
            <Select value={recurring ? 'oui' : 'non'} onChange={(e) => setRecurring(e.target.value === 'oui')}>
              <option value="oui">Tous les mois</option>
              <option value="non">Une seule fois</option>
            </Select>
          </Field>
        </div>
        <PrimaryButton onClick={() => amount > 0 && onAdd({ label, amount, kind, startMonth, recurring })} disabled={amount <= 0}>
          <Check size={18} weight="bold" /> Simuler
        </PrimaryButton>
      </div>
    </Sheet>
  )
}
