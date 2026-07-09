import { Router } from 'express'
import type { Model } from 'mongoose'
import { Income, Subscription, ExpenseTemplate, Transaction, Asset } from '../models/comptes.js'
import {
  monthlyAmount,
  nextDueDate,
  daysUntil,
  projectPatrimoine,
  type Frequency,
  type SimEvent,
} from '../lib/comptes-calc.js'

const router = Router()

// Fabrique de routes CRUD standard pour un modèle
function crud(path: string, Mdl: Model<any>, sort: Record<string, 1 | -1> = { createdAt: -1 }) {
  router.get(`/${path}`, async (_req, res) => {
    res.json(await Mdl.find().sort(sort))
  })
  router.post(`/${path}`, async (req, res) => {
    res.status(201).json(await Mdl.create(req.body))
  })
  router.put(`/${path}/:id`, async (req, res) => {
    const doc = await Mdl.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!doc) return res.status(404).json({ error: 'Introuvable' })
    res.json(doc)
  })
  router.delete(`/${path}/:id`, async (req, res) => {
    await Mdl.findByIdAndDelete(req.params.id)
    res.status(204).end()
  })
}

crud('incomes', Income)
crud('subscriptions', Subscription, { dayOfMonth: 1 })
crud('expense-templates', ExpenseTemplate, { label: 1 })
crud('transactions', Transaction, { date: -1 })
crud('assets', Asset, { createdAt: 1 })

// Mettre de côté : transfère du courant vers un placement + enregistre la transaction
router.post('/set-aside', async (req, res) => {
  const { assetId, amount, label } = req.body
  const asset = await Asset.findById(assetId)
  if (!asset) return res.status(404).json({ error: 'Placement introuvable' })
  asset.balance += Number(amount)
  await asset.save()
  const current = await Asset.findOne({ type: 'courant' })
  if (current) {
    current.balance -= Number(amount)
    await current.save()
  }
  const tx = await Transaction.create({
    label: label || `Épargne → ${asset.name}`,
    amount: Number(amount),
    kind: 'epargne',
    assetId: asset._id,
  })
  res.status(201).json(tx)
})

// Moyenne mensuelle des dépenses variables sur les 3 derniers mois
async function estimateMonthlyVariable(): Promise<number> {
  const from = new Date()
  from.setMonth(from.getMonth() - 3)
  const txs = await Transaction.find({ kind: 'depense', date: { $gte: from } })
  const total = txs.reduce((s, t) => s + t.amount, 0)
  return total / 3
}

// GET /summary?month=YYYY-MM
router.get('/summary', async (req, res) => {
  const monthStr = String(req.query.month || '')
  const now = new Date()
  const [y, m] = /^\d{4}-\d{2}$/.test(monthStr)
    ? monthStr.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1]
  const monthStart = new Date(y, m - 1, 1)
  const monthEnd = new Date(y, m, 1)

  const [incomes, subs, txs, assets] = await Promise.all([
    Income.find({ active: true }),
    Subscription.find({ active: true }),
    Transaction.find({ date: { $gte: monthStart, $lt: monthEnd } }),
    Asset.find(),
  ])

  const incomeMonthly = incomes
    .filter((i) => i.type === 'recurrent')
    .reduce((s, i) => s + monthlyAmount(i.amount, (i.frequency as Frequency) || 'mensuel'), 0)
  const incomePonctuel = txs.filter((t) => t.kind === 'revenu').reduce((s, t) => s + t.amount, 0)

  const subsMonthly = subs.reduce((s, x) => s + monthlyAmount(x.amount, x.frequency as Frequency), 0)
  const variableThisMonth = txs.filter((t) => t.kind === 'depense').reduce((s, t) => s + t.amount, 0)
  const epargneThisMonth = txs.filter((t) => t.kind === 'epargne').reduce((s, t) => s + t.amount, 0)

  const resteAVivre = incomeMonthly + incomePonctuel - subsMonthly - variableThisMonth - epargneThisMonth

  // Répartition des dépenses par catégorie (abonnements mensualisés + dépenses variables)
  const byCategory: Record<string, number> = {}
  for (const x of subs) {
    const c = x.category || 'autre'
    byCategory[c] = (byCategory[c] || 0) + monthlyAmount(x.amount, x.frequency as Frequency)
  }
  for (const t of txs.filter((t) => t.kind === 'depense')) {
    const c = t.category || 'autre'
    byCategory[c] = (byCategory[c] || 0) + t.amount
  }
  const categoryBreakdown = Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount)

  // Prochains prélèvements (6 prochaines échéances)
  const nextDebits = subs
    .map((x) => {
      const due = nextDueDate(x.dayOfMonth)
      return { name: x.name, amount: x.amount, category: x.category, date: due, daysUntil: daysUntil(due) }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 6)

  const patrimoineTotal = assets.reduce((s, a) => s + (a.balance || 0), 0)

  res.json({
    month: `${y}-${String(m).padStart(2, '0')}`,
    incomeMonthly: round2(incomeMonthly + incomePonctuel),
    subsMonthly: round2(subsMonthly),
    subsYearly: round2(subsMonthly * 12),
    variableThisMonth: round2(variableThisMonth),
    epargneThisMonth: round2(epargneThisMonth),
    resteAVivre: round2(resteAVivre),
    patrimoineTotal: round2(patrimoineTotal),
    categoryBreakdown,
    nextDebits,
  })
})

// POST /projection  { horizonMonths, events?: [...] }
router.post('/projection', async (req, res) => {
  const horizonMonths = Math.min(Math.max(Number(req.body.horizonMonths) || 12, 1), 120)
  const events: SimEvent[] = Array.isArray(req.body.events) ? req.body.events : []

  const [incomes, subs, assets, variable] = await Promise.all([
    Income.find({ active: true, type: 'recurrent' }),
    Subscription.find({ active: true }),
    Asset.find(),
    estimateMonthlyVariable(),
  ])

  const incomeMonthly = incomes.reduce(
    (s, i) => s + monthlyAmount(i.amount, (i.frequency as Frequency) || 'mensuel'),
    0
  )
  const subsMonthly = subs.reduce((s, x) => s + monthlyAmount(x.amount, x.frequency as Frequency), 0)
  const plannedContributions = assets
    .filter((a) => a.type !== 'courant')
    .reduce((s, a) => s + (a.monthlyContribution || 0), 0)

  const monthlyNetToCurrent = incomeMonthly - subsMonthly - variable - plannedContributions

  const assetsInput = assets.map((a) => ({
    name: a.name,
    type: a.type,
    balance: a.balance || 0,
    monthlyContribution: a.monthlyContribution || 0,
    annualRate: a.annualRate || 0,
  }))

  const baseline = projectPatrimoine({ horizonMonths, monthlyNetToCurrent, assets: assetsInput })
  const simule = events.length
    ? projectPatrimoine({ horizonMonths, monthlyNetToCurrent, assets: assetsInput, events })
    : null

  res.json({
    horizonMonths,
    monthlyNetToCurrent: round2(monthlyNetToCurrent),
    estimatedMonthlyVariable: round2(variable),
    baseline,
    simule,
  })
})

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export default router
