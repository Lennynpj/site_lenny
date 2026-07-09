// Helpers de calcul financier pour l'app Comptes

export type Frequency = 'mensuel' | 'annuel' | 'hebdo'

/** Ramène un montant à son équivalent mensuel. */
export function monthlyAmount(amount: number, frequency: Frequency = 'mensuel'): number {
  if (frequency === 'annuel') return amount / 12
  if (frequency === 'hebdo') return (amount * 52) / 12
  return amount
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Prochaine date de prélèvement à partir d'un jour du mois.
 * Si le mois n'a pas ce jour (ex. 31 en février), on prend le dernier jour du mois.
 */
export function nextDueDate(dayOfMonth: number, from: Date = new Date()): Date {
  const today = startOfDay(from)
  const y = today.getFullYear()
  const m = today.getMonth()
  const thisMonth = new Date(y, m, Math.min(dayOfMonth, daysInMonth(y, m)))
  if (thisMonth >= today) return thisMonth
  const ny = m === 11 ? y + 1 : y
  const nm = (m + 1) % 12
  return new Date(ny, nm, Math.min(dayOfMonth, daysInMonth(ny, nm)))
}

/** Nombre de jours entiers entre aujourd'hui et une date (>= 0). */
export function daysUntil(date: Date, from: Date = new Date()): number {
  const ms = startOfDay(date).getTime() - startOfDay(from).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

export interface SimEvent {
  label?: string
  amount: number
  kind: 'depense' | 'revenu'
  startMonth: number // 0 = maintenant, 1 = dans 1 mois…
  recurring?: boolean
}

export interface ProjectionAsset {
  name: string
  type: string
  balance: number
  monthlyContribution?: number
  annualRate?: number
}

export interface ProjectionInput {
  horizonMonths: number
  monthlyNetToCurrent: number // revenus − abonnements − dépenses variables − versements planifiés
  assets: ProjectionAsset[]
  events?: SimEvent[]
}

export interface ProjectionPoint {
  month: number
  patrimoine: number
  courant: number
}

/**
 * Projette le patrimoine mois par mois.
 * - Le compte `courant` reçoit le flux mensuel net (+ éventuels events de simulation).
 * - Les autres comptes grossissent de leur versement mensuel + intérêts composés (annualRate/12).
 */
export function projectPatrimoine(input: ProjectionInput): ProjectionPoint[] {
  const { horizonMonths, monthlyNetToCurrent, assets, events = [] } = input
  // Copie des soldes courants
  const balances = assets.map((a) => ({ ...a, balance: a.balance || 0 }))
  const currentIdx = balances.findIndex((a) => a.type === 'courant')

  const points: ProjectionPoint[] = []
  // Point 0 = état actuel
  const total0 = balances.reduce((s, a) => s + a.balance, 0)
  points.push({
    month: 0,
    patrimoine: round2(total0),
    courant: round2(currentIdx >= 0 ? balances[currentIdx].balance : 0),
  })

  for (let month = 1; month <= horizonMonths; month++) {
    // Croissance des placements (hors courant) : versement + intérêts
    for (const a of balances) {
      if (a.type === 'courant') continue
      const rateMonthly = (a.annualRate || 0) / 100 / 12
      a.balance += (a.monthlyContribution || 0) + a.balance * rateMonthly
    }
    // Flux net sur le compte courant
    let flow = monthlyNetToCurrent
    for (const e of events) {
      const applies = e.recurring ? month >= e.startMonth : month === e.startMonth
      if (!applies) continue
      flow += e.kind === 'revenu' ? e.amount : -e.amount
    }
    if (currentIdx >= 0) balances[currentIdx].balance += flow

    const total = balances.reduce((s, a) => s + a.balance, 0)
    points.push({
      month,
      patrimoine: round2(total),
      courant: round2(currentIdx >= 0 ? balances[currentIdx].balance : 0),
    })
  }
  return points
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
