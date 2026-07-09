import { useCallback, useEffect, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CalendarBlank, Plus, Receipt, TrashSimple, TrendUp } from '@phosphor-icons/react'
import { catMeta, comptesApi, formatDueDate, formatEuro } from '../../lib/comptes'
import type { Summary, Transaction } from '../../lib/comptes'
import { CardSkeleton, ErrorBox } from './components/ui'
import AddExpenseSheet from './components/AddExpenseSheet'

function isThisMonth(iso?: string) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const load = useCallback(() => {
    Promise.all([comptesApi.summary(), comptesApi.transactions.list()])
      .then(([s, txs]) => {
        setSummary(s)
        setTransactions(txs.filter((t) => isThisMonth(t.date)))
      })
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => load(), [load])

  async function removeTx(t: Transaction) {
    if (!t._id || !confirm(`Supprimer « ${t.label} » (${formatEuro(t.amount)}) ?`)) return
    await comptesApi.transactions.remove(t._id)
    load()
  }

  if (error) return <ErrorBox message={error} />
  if (!summary)
    return (
      <div className="space-y-4">
        <div className="skeleton h-36 rounded-3xl" />
        <CardSkeleton count={2} h="h-24" />
      </div>
    )

  const positive = summary.resteAVivre >= 0
  const pie = summary.categoryBreakdown.slice(0, 6)

  return (
    <div>
      <div className="md:grid md:grid-cols-2 md:items-start md:gap-6">
      <div>
      {/* Reste à vivre — carte héros */}
      <div
        className="rise rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-zinc-900 to-zinc-900 p-6"
        style={{ '--i': 0 } as React.CSSProperties}
      >
        <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-300/80 uppercase">Reste à vivre ce mois</p>
        <p className={`mt-1 text-4xl font-bold tracking-tighter ${positive ? 'text-white' : 'text-red-400'}`}>
          {formatEuro(summary.resteAVivre)}
        </p>
        <div className="mt-4 grid grid-cols-4 gap-1.5 text-center">
          <Stat label="Revenus" value={formatEuro(summary.incomeMonthly, false)} tone="text-emerald-300" />
          <Stat label="Fixes" value={formatEuro(summary.subsMonthly, false)} tone="text-zinc-300" />
          <Stat label="Dépenses" value={formatEuro(summary.variableThisMonth, false)} tone="text-red-300" />
          <Stat label="Épargne" value={formatEuro(summary.epargneThisMonth, false)} tone="text-sky-300" />
        </div>
      </div>

      {/* Patrimoine */}
      <div
        className="rise mt-3 flex items-center gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-4"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
          <TrendUp size={20} weight="bold" />
        </span>
        <div className="flex-1">
          <p className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">Patrimoine total</p>
          <p className="text-xl font-semibold text-white">{formatEuro(summary.patrimoineTotal)}</p>
        </div>
      </div>

      {/* Ajout rapide */}
      <button
        onClick={() => setAddOpen(true)}
        className="rise mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/[0.04] py-4 font-semibold text-emerald-300 transition hover:border-emerald-400/50 active:scale-[0.99]"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        <Plus size={18} weight="bold" /> Ajouter une dépense
      </button>

      {/* Dépenses du mois (courses, essence…) */}
      <section className="rise mt-6" style={{ '--i': 3 } as React.CSSProperties}>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Receipt size={16} className="text-zinc-500" /> Dépenses du mois
          <span className="ml-auto font-mono text-xs font-normal text-zinc-500">
            {formatEuro(summary.variableThisMonth)}
          </span>
        </h2>
        {transactions.length === 0 ? (
          <p className="rounded-xl bg-zinc-900/60 p-4 text-sm text-zinc-500">
            Aucune dépense ce mois-ci. Utilise « Ajouter une dépense » avec tes modèles (Courses, Essence…).
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800/60 bg-zinc-900/50">
            {transactions.map((t) => {
              const c = catMeta(t.category)
              const tone = t.kind === 'revenu' ? 'text-emerald-300' : t.kind === 'epargne' ? 'text-sky-300' : 'text-red-300'
              const sign = t.kind === 'revenu' ? '+' : t.kind === 'epargne' ? '↓' : '−'
              return (
                <li key={t._id} className="flex items-center gap-3 px-4 py-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-200">{t.label}</p>
                    <p className="font-mono text-[11px] text-zinc-500">
                      {t.date ? new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                    </p>
                  </div>
                  <span className={`font-mono text-sm ${tone}`}>
                    {sign}{formatEuro(t.amount)}
                  </span>
                  <button
                    onClick={() => removeTx(t)}
                    aria-label="Supprimer"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition hover:text-red-400 active:scale-95"
                  >
                    <TrashSimple size={14} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      </div>

      <div>
      {/* Prochains prélèvements */}
      <section className="rise mt-6 md:mt-0" style={{ '--i': 4 } as React.CSSProperties}>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <CalendarBlank size={16} className="text-zinc-500" /> Prochains prélèvements
        </h2>
        {summary.nextDebits.length === 0 ? (
          <p className="rounded-xl bg-zinc-900/60 p-4 text-sm text-zinc-500">Aucun abonnement enregistré.</p>
        ) : (
          <ul className="divide-y divide-zinc-800/60 rounded-2xl border border-zinc-800/60 bg-zinc-900/50">
            {summary.nextDebits.map((d, i) => {
              const c = catMeta(d.category)
              return (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="flex-1 text-sm text-zinc-200">{d.name}</span>
                  <span className="text-right">
                    <span className="block font-mono text-sm text-white">{formatEuro(d.amount)}</span>
                    <span className="block font-mono text-[11px] text-zinc-500">
                      {d.daysUntil === 0 ? "aujourd'hui" : d.daysUntil === 1 ? 'demain' : `dans ${d.daysUntil} j`} ·{' '}
                      {formatDueDate(d.date)}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Répartition par catégorie */}
      {pie.length > 0 && (
        <section className="rise mt-6" style={{ '--i': 5 } as React.CSSProperties}>
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Répartition des dépenses</h2>
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="amount" nameKey="category" innerRadius={38} outerRadius={62} paddingAngle={2} stroke="none">
                    {pie.map((s) => (
                      <Cell key={s.category} fill={catMeta(s.category).color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 10, fontSize: 12 }}
                    formatter={(v, n) => [formatEuro(Number(v)), catMeta(String(n)).label]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {pie.map((s) => (
                <li key={s.category} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: catMeta(s.category).color }} />
                  <span className="flex-1 truncate text-zinc-300">{catMeta(s.category).label}</span>
                  <span className="font-mono text-xs text-zinc-400">{formatEuro(s.amount, false)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      </div>
      </div>

      <AddExpenseSheet open={addOpen} onClose={() => setAddOpen(false)} onAdded={load} />
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-black/20 px-1 py-2">
      <p className="truncate font-mono text-[9px] tracking-wider text-zinc-500 uppercase">{label}</p>
      <p className={`mt-0.5 truncate font-mono text-[13px] font-semibold ${tone}`}>{value}</p>
    </div>
  )
}
