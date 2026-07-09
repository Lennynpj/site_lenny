import { useEffect, useState } from 'react'
import { ArrowDown, Bank, Check, PencilSimple, Plus, TrashSimple, Vault } from '@phosphor-icons/react'
import { ASSET_LABEL, comptesApi, formatEuro } from '../../lib/comptes'
import type { Asset, AssetType } from '../../lib/comptes'
import { CardSkeleton, EmptyState, ErrorBox, Field, MoneyInput, PrimaryButton, Select, Sheet, TextInput } from './components/ui'

const TYPES: AssetType[] = ['courant', 'livret', 'pea', 'assurance-vie', 'especes', 'autre']
const blank = (): Asset => ({ name: '', type: 'livret', balance: 0, monthlyContribution: 0, annualRate: 0 })

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Asset | null>(null)
  const [setAside, setSetAside] = useState(false)

  const load = () => comptesApi.assets.list().then(setAssets).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  async function remove(a: Asset) {
    if (!a._id || !confirm(`Supprimer « ${a.name} » ?`)) return
    await comptesApi.assets.remove(a._id)
    load()
  }

  if (error) return <ErrorBox message={error} />
  if (!assets) return <CardSkeleton count={3} h="h-28" />

  const total = assets.reduce((s, a) => s + (a.balance || 0), 0)
  const hasCourant = assets.some((a) => a.type === 'courant')
  const placements = assets.filter((a) => a.type !== 'courant')

  return (
    <div>
      <div className="rise mb-4" style={{ '--i': 0 } as React.CSSProperties}>
        <h2 className="text-3xl font-bold tracking-tighter text-white">Patrimoine</h2>
        <p className="mt-1 text-3xl font-bold tracking-tighter text-emerald-300">{formatEuro(total)}</p>
      </div>

      <div className="rise mb-4 flex gap-2" style={{ '--i': 1 } as React.CSSProperties}>
        <button
          onClick={() => setEditing(blank())}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/70 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" /> Compte / placement
        </button>
        <button
          onClick={() => setSetAside(true)}
          disabled={!hasCourant || placements.length === 0}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-400/15 py-2.5 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/25 active:scale-[0.98] disabled:opacity-40"
        >
          <ArrowDown size={16} weight="bold" /> Mettre de côté
        </button>
      </div>

      {assets.length === 0 ? (
        <EmptyState icon={<Vault size={26} />} title="Aucun compte" hint="Ajoute ton compte courant, ton Livret A, ton PEA…" />
      ) : (
        <ul className="space-y-3">
          {assets.map((a, i) => (
            <li
              key={a._id}
              className="rise rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-4"
              style={{ '--i': i + 2 } as React.CSSProperties}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    a.type === 'courant' ? 'bg-zinc-700/50 text-zinc-300' : 'bg-emerald-400/15 text-emerald-300'
                  }`}
                >
                  {a.type === 'courant' ? <Bank size={20} weight="fill" /> : <Vault size={20} weight="fill" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{a.name}</p>
                  <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{ASSET_LABEL[a.type]}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(a)} aria-label="Modifier" className="text-zinc-600 hover:text-zinc-300">
                    <PencilSimple size={15} />
                  </button>
                  <button onClick={() => remove(a)} aria-label="Supprimer" className="text-zinc-600 hover:text-red-400">
                    <TrashSimple size={15} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-white">{formatEuro(a.balance)}</p>
              {(a.monthlyContribution || a.annualRate) && a.type !== 'courant' ? (
                <p className="mt-1 font-mono text-xs text-zinc-500">
                  {a.monthlyContribution ? `+${formatEuro(a.monthlyContribution, false)}/mois` : ''}
                  {a.monthlyContribution && a.annualRate ? ' · ' : ''}
                  {a.annualRate ? `${a.annualRate}%/an` : ''}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {editing && <AssetForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
      {setAside && <SetAsideForm assets={placements} onClose={() => setSetAside(false)} onSaved={() => { setSetAside(false); load() }} />}
    </div>
  )
}

function AssetForm({ initial, onClose, onSaved }: { initial: Asset; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Asset>(initial)
  const [saving, setSaving] = useState(false)
  const set = (patch: Partial<Asset>) => setF((prev) => ({ ...prev, ...patch }))
  const isCourant = f.type === 'courant'

  async function save() {
    if (!f.name) return
    setSaving(true)
    try {
      if (f._id) await comptesApi.assets.update(f._id, f)
      else await comptesApi.assets.create(f)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onClose={onClose} title={f._id ? 'Modifier le compte' : 'Nouveau compte / placement'}>
      <div className="space-y-4">
        <Field label="Nom">
          <TextInput value={f.name} placeholder="Ex. Livret A" onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={f.type} onChange={(e) => set({ type: e.target.value as AssetType })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{ASSET_LABEL[t]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Solde actuel">
            <MoneyInput value={f.balance || ''} onChange={(n) => set({ balance: n })} />
          </Field>
        </div>
        {!isCourant && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Versement / mois">
              <MoneyInput value={f.monthlyContribution || ''} onChange={(n) => set({ monthlyContribution: n })} />
            </Field>
            <Field label="Rendement %/an">
              <TextInput
                type="number"
                step={0.1}
                min={0}
                value={f.annualRate ?? 0}
                onChange={(e) => set({ annualRate: Number(e.target.value) })}
              />
            </Field>
          </div>
        )}
        <PrimaryButton onClick={save} disabled={saving || !f.name}>
          <Check size={18} weight="bold" /> {saving ? '…' : 'Enregistrer'}
        </PrimaryButton>
      </div>
    </Sheet>
  )
}

function SetAsideForm({ assets, onClose, onSaved }: { assets: Asset[]; onClose: () => void; onSaved: () => void }) {
  const [assetId, setAssetId] = useState(assets[0]?._id ?? '')
  const [amount, setAmount] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!assetId || amount <= 0) return
    setSaving(true)
    try {
      await comptesApi.setAside(assetId, amount)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onClose={onClose} title="Mettre de côté">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">Transfère de l'argent de ton compte courant vers un placement.</p>
        <Field label="Vers quel placement">
          <Select value={assetId} onChange={(e) => setAssetId(e.target.value)}>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Montant">
          <MoneyInput value={amount || ''} onChange={setAmount} autoFocus />
        </Field>
        <PrimaryButton onClick={save} disabled={saving || amount <= 0}>
          <ArrowDown size={18} weight="bold" /> {saving ? '…' : 'Mettre de côté'}
        </PrimaryButton>
      </div>
    </Sheet>
  )
}
