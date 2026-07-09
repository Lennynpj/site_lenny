// Types + API client de l'app Comptes

export interface Income {
  _id?: string
  label: string
  amount: number
  type: 'recurrent' | 'ponctuel'
  dayOfMonth?: number
  date?: string
  frequency?: 'mensuel' | 'annuel'
  category?: string
  active: boolean
  note?: string
}

export interface Subscription {
  _id?: string
  name: string
  amount: number
  dayOfMonth: number
  frequency: 'mensuel' | 'annuel' | 'hebdo'
  category: string
  active: boolean
  color?: string
  note?: string
}

export interface ExpenseTemplate {
  _id?: string
  label: string
  defaultAmount: number
  category: string
  color?: string
  icon?: string
}

export interface Transaction {
  _id?: string
  label: string
  amount: number
  date?: string
  kind: 'depense' | 'revenu' | 'epargne'
  category?: string
  templateId?: string
  assetId?: string
  note?: string
}

export type AssetType = 'courant' | 'livret' | 'pea' | 'assurance-vie' | 'especes' | 'autre'

export interface Asset {
  _id?: string
  name: string
  type: AssetType
  balance: number
  monthlyContribution?: number
  annualRate?: number
  note?: string
}

export interface NextDebit {
  name: string
  amount: number
  category: string
  date: string
  daysUntil: number
}

export interface CategorySlice {
  category: string
  amount: number
}

export interface Summary {
  month: string
  incomeMonthly: number
  subsMonthly: number
  subsYearly: number
  variableThisMonth: number
  epargneThisMonth: number
  resteAVivre: number
  patrimoineTotal: number
  categoryBreakdown: CategorySlice[]
  nextDebits: NextDebit[]
}

export interface SimEvent {
  label?: string
  amount: number
  kind: 'depense' | 'revenu'
  startMonth: number
  recurring?: boolean
}

export interface ProjectionPoint {
  month: number
  patrimoine: number
  courant: number
}

export interface Projection {
  horizonMonths: number
  monthlyNetToCurrent: number
  estimatedMonthlyVariable: number
  baseline: ProjectionPoint[]
  simule: ProjectionPoint[] | null
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/comptes${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Erreur API (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Petit CRUD générique
function crud<T extends { _id?: string }>(path: string) {
  return {
    list: () => request<T[]>(`/${path}`),
    create: (body: Omit<T, '_id'>) => request<T>(`/${path}`, { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<T>) =>
      request<T>(`/${path}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/${path}/${id}`, { method: 'DELETE' }),
  }
}

export const comptesApi = {
  incomes: crud<Income>('incomes'),
  subscriptions: crud<Subscription>('subscriptions'),
  templates: crud<ExpenseTemplate>('expense-templates'),
  transactions: crud<Transaction>('transactions'),
  assets: crud<Asset>('assets'),
  summary: (month?: string) => request<Summary>(`/summary${month ? `?month=${month}` : ''}`),
  projection: (horizonMonths: number, events?: SimEvent[]) =>
    request<Projection>('/projection', { method: 'POST', body: JSON.stringify({ horizonMonths, events }) }),
  setAside: (assetId: string, amount: number, label?: string) =>
    request<Transaction>('/set-aside', { method: 'POST', body: JSON.stringify({ assetId, amount, label }) }),
}

// ── Helpers d'affichage ──────────────────────────────────────────

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const euro0 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export function formatEuro(n: number, decimals = true): string {
  return (decimals ? euro : euro0).format(n ?? 0)
}

export const CATEGORY_META: Record<string, { label: string; color: string }> = {
  logement: { label: 'Logement', color: '#60a5fa' },
  alimentation: { label: 'Alimentation', color: '#34d399' },
  transport: { label: 'Transport', color: '#f59e0b' },
  sorties: { label: 'Sorties', color: '#f472b6' },
  sport: { label: 'Sport', color: '#a3e635' },
  streaming: { label: 'Streaming', color: '#c084fc' },
  télécom: { label: 'Télécom', color: '#22d3ee' },
  assurance: { label: 'Assurance', color: '#94a3b8' },
  salaire: { label: 'Salaire', color: '#10b981' },
  freelance: { label: 'Freelance', color: '#14b8a6' },
  autre: { label: 'Autre', color: '#71717a' },
}

export function catMeta(cat?: string) {
  return CATEGORY_META[cat ?? 'autre'] ?? { label: cat ?? 'Autre', color: '#71717a' }
}

export const ASSET_LABEL: Record<AssetType, string> = {
  courant: 'Compte courant',
  livret: 'Livret',
  pea: 'PEA',
  'assurance-vie': 'Assurance-vie',
  especes: 'Espèces',
  autre: 'Autre',
}

export function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
