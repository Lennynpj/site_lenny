// Types + API client de l'app Comptes
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'

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

// ── Jeton de session (profil) ────────────────────────────────────
const TOKEN_KEY = 'comptes_token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`/api/comptes${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-profile-token': token } : {}),
    },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    if (res.status === 401) clearToken()
    const err = new Error(body?.error ?? `Erreur API (${res.status})`) as Error & { status?: number }
    err.status = res.status
    throw err
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

export interface ProfilePublic {
  _id: string
  name: string
  avatarColor: string
  hasFaceId: boolean
}

export const authApi = {
  profiles: () => request<ProfilePublic[]>('/profiles'),
  createProfile: (name: string, password: string, avatarColor: string) =>
    request<{ token: string; profile: ProfilePublic }>('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name, password, avatarColor }),
    }),
  login: (profileId: string, password: string) =>
    request<{ token: string; profile: ProfilePublic }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ profileId, password }),
    }),
  me: () => request<ProfilePublic>('/auth/me'),
  // Face ID / WebAuthn
  faceIdSupported: () =>
    typeof window !== 'undefined' && !!window.PublicKeyCredential && window.isSecureContext,
  registerFaceId: async () => {
    const options = await request<Record<string, unknown>>('/auth/webauthn/register/options', {
      method: 'POST',
      body: '{}',
    })
    const att = await startRegistration({ optionsJSON: options as never })
    await request('/auth/webauthn/register/verify', { method: 'POST', body: JSON.stringify(att) })
  },
  loginFaceId: async (profileId: string) => {
    const options = await request<Record<string, unknown>>('/auth/webauthn/login/options', {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    })
    const asr = await startAuthentication({ optionsJSON: options as never })
    return request<{ token: string; profile: ProfilePublic }>('/auth/webauthn/login/verify', {
      method: 'POST',
      body: JSON.stringify({ profileId, response: asr }),
    })
  },
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
