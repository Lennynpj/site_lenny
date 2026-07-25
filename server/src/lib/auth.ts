// Hachage de mot de passe (scrypt) + jeton de session signé (HMAC).
// Utilise uniquement node:crypto — aucune dépendance native.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me'
const TOKEN_TTL_MS = 180 * 24 * 60 * 60 * 1000 // 6 mois
/** En dessous de ce seuil, on réémet le jeton : la session glisse tant que
 *  l'app est ouverte régulièrement (évite une déconnexion incomprise). */
const RENOUVELLEMENT_MS = 30 * 24 * 60 * 60 * 1000 // 30 jours

// ── Mots de passe ────────────────────────────────────────────────
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return { hash, salt }
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!hash || !salt) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

// ── Jetons de session : base64url(payload).signature ─────────────
function sign(data: string): string {
  return createHmac('sha256', AUTH_SECRET).update(data).digest('base64url')
}

export function issueToken(profileId: string): string {
  const payload = Buffer.from(JSON.stringify({ pid: profileId, exp: Date.now() + TOKEN_TTL_MS })).toString(
    'base64url'
  )
  return `${payload}.${sign(payload)}`
}

export function verifyToken(token?: string): string | null {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = sign(payload)
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const { pid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!pid || typeof exp !== 'number' || exp < Date.now()) return null
    return pid as string
  } catch {
    return null
  }
}

/** Renvoie un jeton frais si celui-ci approche de l'expiration, sinon null. */
export function renewIfNeeded(token: string | undefined, profileId: string): string | null {
  if (!token) return null
  try {
    const { exp } = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString())
    if (typeof exp !== 'number') return null
    return exp - Date.now() < RENOUVELLEMENT_MS ? issueToken(profileId) : null
  } catch {
    return null
  }
}

// Config WebAuthn (relying party)
export const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost'
// Ce texte s'affiche dans la fenêtre système Face ID : il doit rester neutre.
export const RP_NAME = 'Mes comptes'
export const RP_ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:5173'
