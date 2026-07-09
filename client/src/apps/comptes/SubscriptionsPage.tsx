import { useEffect, useState } from 'react'
import { ArrowsClockwise, Check, PencilSimple, Plus, TrashSimple } from '@phosphor-icons/react'
import { catMeta, comptesApi, formatEuro } from '../../lib/comptes'
import type { Subscription } from '../../lib/comptes'
import { CardSkeleton, EmptyState, ErrorBox, Field, MoneyInput, PrimaryButton, Select, Sheet, TextInput } from './components/ui'

const CATEGORIES = ['logement', 'sport', 'streaming', 'télécom', 'assurance', 'transport', 'autre']
const FREQS = ['mensuel', 'annuel', 'hebdo'] as const

function monthly(s: Subscription) {
  if (s.frequency === 'annuel') return s.amount / 12
  if (s.frequency === 'hebdo') return (s.amount * 52) / 12
  return s.amount
}

const blank = (): Subscription => ({ name: '', amount: 0, dayOfMonth: 1, frequency: 'mensuel', category: 'autre', active: true })

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Subscription | null>(null)

  const load = () => comptesApi.subscriptions.list().then(setSubs).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  async function toggle(s: Subscription) {
    if (!s._id) return
    await comptesApi.subscriptions.update(s._id, { active: !s.active })
    load()
  }
  async function remove(s: Subscription) {
    if (!s._id || !confirm(`Supprimer « ${s.name} » ?`)) return
    await comptesApi.subscriptions.remove(s._id)
    load()
  }

  if (error) return <ErrorBox message={error} />
  if (!subs) return <CardSkeleton count={5} />

  const activeSubs = subs.filter((s) => s.active)
  const totalMonthly = activeSubs.reduce((sum, s) => sum + monthly(s), 0)
  const sorted = [...subs].sort((a, b) => a.dayOfMonth - b.dayOfMonth)

  return (
    <div>
      <div className="rise mb-4 flex items-end justify-between" style={{ '--i': 0 } as React.CSSProperties}>
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">Abonnements</h2>
          <p className="mt-1 text-sm text-zinc-500">
            <span className="font-semibold text-emerald-300">{formatEuro(totalMonthly)}</span> / mois ·{' '}
            {formatEuro(totalMonthly * 12, false)} / an
          </p>
        </div>
        <button
          onClick={() => setEditing(blank())}
          aria-label="Ajouter un abonnement"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-zinc-950 transition active:scale-95"
        >
          <Plus size={20} weight="bold" />
        </button>
      </div>

      {subs.length === 0 ? (
        <EmptyState icon={<ArrowsClockwise size={26} />} title="Aucun abonnement" hint="Ajoute Netflix, ta salle, ton loyer… avec leur date de prélèvement." />
      ) : (
        <ul className="space-y-2.5">
          {sorted.map((s, i) => {
            const c = catMeta(s.category)
            return (
              <li
                key={s._id}
                className={`rise flex items-center gap-3 rounded-2xl border bg-zinc-900/70 p-3.5 ${
                  s.active ? 'border-zinc-800/60' : 'border-zinc-800/40 opacity-55'
                }`}
                style={{ '--i': i + 1 } as React.CSSProperties}
              >
                <span
                  className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl font-mono leading-none"
                  style={{ backgroundColor: `${c.color}22`, color: c.color }}
                >
                  <span className="text-[9px] tracking-wider uppercase opacity-70">le</span>
                  <span className="text-base font-bold">{s.dayOfMonth}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{s.name}</p>
                  <p className="font-mono text-xs text-zinc-500">
                    {c.label}
                    {s.frequency !== 'mensuel' && ` · ${s.frequency}`}
                  </p>
                </div>
                <span className="text-right font-mono text-sm text-white">{formatEuro(s.amount)}</span>
                <div className="flex flex-col gap-1">
                  <button onClick={() => toggle(s)} aria-label="Actif/pause" className={`h-2.5 w-2.5 rounded-full ${s.active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  <button onClick={() => setEditing(s)} aria-label="Modifier" className="text-zinc-600 hover:text-zinc-300">
                    <PencilSimple size={15} />
                  </button>
                  <button onClick={() => remove(s)} aria-label="Supprimer" className="text-zinc-600 hover:text-red-400">
                    <TrashSimple size={15} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <SubForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

function SubForm({ initial, onClose, onSaved }: { initial: Subscription; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Subscription>(initial)
  const [saving, setSaving] = useState(false)
  const set = (patch: Partial<Subscription>) => setF((prev) => ({ ...prev, ...patch }))

  async function save() {
    if (!f.name || f.amount <= 0) return
    setSaving(true)
    try {
      if (f._id) await comptesApi.subscriptions.update(f._id, f)
      else await comptesApi.subscriptions.create(f)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onClose={onClose} title={f._id ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}>
      <div className="space-y-4">
        <Field label="Nom">
          <TextInput value={f.name} placeholder="Ex. Netflix" onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Montant">
            <MoneyInput value={f.amount || ''} onChange={(n) => set({ amount: n })} />
          </Field>
          <Field label="Jour de prélèvement">
            <TextInput
              type="number"
              min={1}
              max={31}
              value={f.dayOfMonth}
              onChange={(e) => set({ dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value))) })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fréquence">
            <Select value={f.frequency} onChange={(e) => set({ frequency: e.target.value as Subscription['frequency'] })}>
              {FREQS.map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </Select>
          </Field>
          <Field label="Catégorie">
            <Select value={f.category} onChange={(e) => set({ category: e.target.value })}>
              {CATEGORIES.map((x) => (
                <option key={x} value={x}>{catMeta(x).label}</option>
              ))}
            </Select>
          </Field>
        </div>
        <PrimaryButton onClick={save} disabled={saving || !f.name || f.amount <= 0}>
          <Check size={18} weight="bold" /> {saving ? '…' : 'Enregistrer'}
        </PrimaryButton>
      </div>
    </Sheet>
  )
}
