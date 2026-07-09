import { useEffect, useState } from 'react'
import { Check, Coins, PencilSimple, Plus, TrashSimple } from '@phosphor-icons/react'
import { comptesApi, formatEuro } from '../../lib/comptes'
import type { Income } from '../../lib/comptes'
import { CardSkeleton, EmptyState, ErrorBox, Field, MoneyInput, PrimaryButton, Select, Sheet, TextInput } from './components/ui'

function monthly(i: Income) {
  if (i.type !== 'recurrent') return 0
  return i.frequency === 'annuel' ? i.amount / 12 : i.amount
}

const blank = (): Income => ({ label: '', amount: 0, type: 'recurrent', dayOfMonth: 1, frequency: 'mensuel', active: true })

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Income | null>(null)

  const load = () => comptesApi.incomes.list().then(setIncomes).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  async function remove(i: Income) {
    if (!i._id || !confirm(`Supprimer « ${i.label} » ?`)) return
    await comptesApi.incomes.remove(i._id)
    load()
  }

  if (error) return <ErrorBox message={error} />
  if (!incomes) return <CardSkeleton count={3} />

  const totalMonthly = incomes.filter((i) => i.active).reduce((s, i) => s + monthly(i), 0)

  return (
    <div>
      <div className="rise mb-4 flex items-end justify-between" style={{ '--i': 0 } as React.CSSProperties}>
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">Revenus</h2>
          <p className="mt-1 text-sm text-zinc-500">
            <span className="font-semibold text-emerald-300">{formatEuro(totalMonthly)}</span> / mois (récurrents)
          </p>
        </div>
        <button
          onClick={() => setEditing(blank())}
          aria-label="Ajouter un revenu"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-zinc-950 transition active:scale-95"
        >
          <Plus size={20} weight="bold" />
        </button>
      </div>

      {incomes.length === 0 ? (
        <EmptyState icon={<Coins size={26} />} title="Aucun revenu" hint="Ajoute ton salaire, tes revenus freelance…" />
      ) : (
        <ul className="space-y-2.5 md:grid md:grid-cols-2 md:items-start md:gap-3 md:space-y-0">
          {incomes.map((i, idx) => (
            <li
              key={i._id}
              className={`rise flex items-center gap-3 rounded-2xl border bg-zinc-900/70 p-3.5 ${
                i.active ? 'border-zinc-800/60' : 'border-zinc-800/40 opacity-55'
              }`}
              style={{ '--i': idx + 1 } as React.CSSProperties}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <Coins size={20} weight="fill" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{i.label}</p>
                <p className="font-mono text-xs text-zinc-500">
                  {i.type === 'recurrent' ? `récurrent · le ${i.dayOfMonth}` : 'ponctuel'}
                  {i.frequency === 'annuel' && ' · annuel'}
                </p>
              </div>
              <span className="font-mono text-sm text-emerald-300">+{formatEuro(i.amount)}</span>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => setEditing(i)} aria-label="Modifier" className="text-zinc-600 hover:text-zinc-300">
                  <PencilSimple size={15} />
                </button>
                <button onClick={() => remove(i)} aria-label="Supprimer" className="text-zinc-600 hover:text-red-400">
                  <TrashSimple size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <IncomeForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
      )}
    </div>
  )
}

function IncomeForm({ initial, onClose, onSaved }: { initial: Income; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Income>(initial)
  const [saving, setSaving] = useState(false)
  const set = (patch: Partial<Income>) => setF((prev) => ({ ...prev, ...patch }))

  async function save() {
    if (!f.label || f.amount <= 0) return
    setSaving(true)
    try {
      if (f._id) await comptesApi.incomes.update(f._id, f)
      else await comptesApi.incomes.create(f)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onClose={onClose} title={f._id ? 'Modifier le revenu' : 'Nouveau revenu'}>
      <div className="space-y-4">
        <Field label="Libellé">
          <TextInput value={f.label} placeholder="Ex. Salaire" onChange={(e) => set({ label: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Montant">
            <MoneyInput value={f.amount || ''} onChange={(n) => set({ amount: n })} />
          </Field>
          <Field label="Type">
            <Select value={f.type} onChange={(e) => set({ type: e.target.value as Income['type'] })}>
              <option value="recurrent">Récurrent</option>
              <option value="ponctuel">Ponctuel</option>
            </Select>
          </Field>
        </div>
        {f.type === 'recurrent' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jour de versement">
              <TextInput
                type="number"
                min={1}
                max={31}
                value={f.dayOfMonth}
                onChange={(e) => set({ dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value))) })}
              />
            </Field>
            <Field label="Fréquence">
              <Select value={f.frequency} onChange={(e) => set({ frequency: e.target.value as Income['frequency'] })}>
                <option value="mensuel">mensuel</option>
                <option value="annuel">annuel</option>
              </Select>
            </Field>
          </div>
        )}
        <PrimaryButton onClick={save} disabled={saving || !f.label || f.amount <= 0}>
          <Check size={18} weight="bold" /> {saving ? '…' : 'Enregistrer'}
        </PrimaryButton>
      </div>
    </Sheet>
  )
}
