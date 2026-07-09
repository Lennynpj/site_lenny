import { useEffect, useState } from 'react'
import { Check, PencilSimple, Plus, TrashSimple } from '@phosphor-icons/react'
import { catMeta, comptesApi } from '../../../lib/comptes'
import type { ExpenseTemplate } from '../../../lib/comptes'
import { Field, MoneyInput, PrimaryButton, Sheet, TextInput } from './ui'

/**
 * Ajout rapide d'une dépense à partir d'un modèle réutilisable.
 * On sélectionne un modèle → le montant se pré-remplit à son prix par défaut,
 * modifiable avant de valider. Gestion des modèles intégrée.
 */
export default function AddExpenseSheet({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([])
  const [selected, setSelected] = useState<ExpenseTemplate | null>(null)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [manage, setManage] = useState(false)

  useEffect(() => {
    if (open) comptesApi.templates.list().then(setTemplates)
  }, [open])

  function pick(t: ExpenseTemplate) {
    setSelected(t)
    setLabel(t.label)
    setAmount(t.defaultAmount)
  }

  function reset() {
    setSelected(null)
    setLabel('')
    setAmount(0)
  }

  async function save() {
    if (!label || amount <= 0) return
    setSaving(true)
    try {
      await comptesApi.transactions.create({
        label,
        amount,
        kind: 'depense',
        category: selected?.category ?? 'autre',
        templateId: selected?._id,
      })
      reset()
      onAdded()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={manage ? 'Mes modèles de dépense' : 'Ajouter une dépense'}>
      {manage ? (
        <TemplateManager
          templates={templates}
          onChange={() => comptesApi.templates.list().then(setTemplates)}
          onDone={() => setManage(false)}
        />
      ) : (
        <div className="space-y-4">
          {templates.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[11px] tracking-wider text-zinc-500 uppercase">Modèles</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => {
                  const active = selected?._id === t._id
                  const c = catMeta(t.category)
                  return (
                    <button
                      key={t._id}
                      onClick={() => pick(t)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition active:scale-95 ${
                        active
                          ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-200'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {t.label}
                      <span className="font-mono text-xs text-zinc-500">{t.defaultAmount}€</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <Field label="Libellé">
            <TextInput value={label} placeholder="Ex. Courses" onChange={(e) => setLabel(e.target.value)} />
          </Field>
          <Field label="Montant">
            <MoneyInput value={amount || ''} onChange={setAmount} autoFocus={!!selected} />
          </Field>

          <PrimaryButton onClick={save} disabled={saving || !label || amount <= 0}>
            <Check size={18} weight="bold" />
            {saving ? '…' : 'Ajouter la dépense'}
          </PrimaryButton>

          <button
            onClick={() => setManage(true)}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            <PencilSimple size={13} /> Gérer mes modèles
          </button>
        </div>
      )}
    </Sheet>
  )
}

function TemplateManager({
  templates,
  onChange,
  onDone,
}: {
  templates: ExpenseTemplate[]
  onChange: () => void
  onDone: () => void
}) {
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState<number>(0)

  async function add() {
    if (!label) return
    await comptesApi.templates.create({ label, defaultAmount: amount, category: 'autre' })
    setLabel('')
    setAmount(0)
    onChange()
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {templates.map((t) => (
          <li key={t._id} className="flex items-center gap-2 rounded-xl bg-zinc-800/40 px-3 py-2.5">
            <span className="flex-1 text-sm text-zinc-200">{t.label}</span>
            <span className="font-mono text-xs text-zinc-500">{t.defaultAmount} €</span>
            <button
              onClick={async () => {
                if (t._id) await comptesApi.templates.remove(t._id)
                onChange()
              }}
              aria-label="Supprimer le modèle"
              className="text-zinc-600 transition hover:text-red-400 active:scale-95"
            >
              <TrashSimple size={16} />
            </button>
          </li>
        ))}
        {templates.length === 0 && <p className="text-sm text-zinc-500">Aucun modèle pour l'instant.</p>}
      </ul>

      <div className="rounded-xl border border-dashed border-zinc-700 p-3">
        <div className="grid grid-cols-[1fr_6rem] gap-2">
          <TextInput value={label} placeholder="Nouveau modèle" onChange={(e) => setLabel(e.target.value)} />
          <MoneyInput value={amount || ''} onChange={setAmount} />
        </div>
        <button
          onClick={add}
          disabled={!label}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-zinc-700 disabled:opacity-40"
        >
          <Plus size={15} weight="bold" /> Créer le modèle
        </button>
      </div>

      <button onClick={onDone} className="w-full text-center text-sm font-medium text-zinc-400 hover:text-white">
        ← Retour à l'ajout
      </button>
    </div>
  )
}
