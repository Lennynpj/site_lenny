import { Router, type Request, type Response, type NextFunction } from 'express'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import { Profile, ExpenseTemplate } from '../models/comptes.js'
import { hashPassword, verifyPassword, issueToken, verifyToken, RP_ID, RP_NAME, RP_ORIGIN } from '../lib/auth.js'

export interface AuthedRequest extends Request {
  profileId?: string
}

// Middleware : exige un token de profil valide, injecte req.profileId
export function requireProfile(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = (req.headers['x-profile-token'] as string) || req.headers.authorization?.replace('Bearer ', '')
  const pid = verifyToken(token)
  if (!pid) return res.status(401).json({ error: 'Non authentifié' })
  req.profileId = pid
  next()
}

const router = Router()

function publicProfile(p: any) {
  return {
    _id: p._id,
    name: p.name,
    avatarColor: p.avatarColor,
    hasFaceId: (p.webauthnCredentials?.length ?? 0) > 0,
  }
}

// Liste des profils (pour l'écran de choix) — aucune donnée sensible
router.get('/profiles', async (_req, res) => {
  const profiles = await Profile.find().sort({ createdAt: 1 })
  res.json(profiles.map(publicProfile))
})

// Créer un profil (setup familial, max 5)
router.post('/profiles', async (req, res) => {
  const { name, password, avatarColor } = req.body
  if (!name || !password || String(password).length < 4)
    return res.status(400).json({ error: 'Nom et mot de passe (min. 4 caractères) requis' })
  if ((await Profile.countDocuments()) >= 5) return res.status(400).json({ error: 'Nombre max de profils atteint' })
  const { hash, salt } = hashPassword(String(password))
  const profile = await Profile.create({ name, avatarColor, passwordHash: hash, passwordSalt: salt })
  // Modèles de dépense de départ (modifiables/supprimables dans l'app)
  await ExpenseTemplate.create([
    { profileId: profile._id, label: 'Courses', defaultAmount: 50, category: 'alimentation', color: '#34d399' },
    { profileId: profile._id, label: 'Essence', defaultAmount: 60, category: 'transport', color: '#f59e0b' },
    { profileId: profile._id, label: 'Resto', defaultAmount: 25, category: 'sorties', color: '#f472b6' },
  ])
  res.status(201).json({ token: issueToken(String(profile._id)), profile: publicProfile(profile) })
})

// Connexion par mot de passe
router.post('/auth/login', async (req, res) => {
  const { profileId, password } = req.body
  const profile = await Profile.findById(profileId)
  if (!profile || !verifyPassword(String(password), profile.passwordHash, profile.passwordSalt))
    return res.status(401).json({ error: 'Mot de passe incorrect' })
  res.json({ token: issueToken(String(profile._id)), profile: publicProfile(profile) })
})

// Profil courant
router.get('/auth/me', requireProfile, async (req: AuthedRequest, res) => {
  const profile = await Profile.findById(req.profileId)
  if (!profile) return res.status(404).json({ error: 'Profil introuvable' })
  res.json(publicProfile(profile))
})

// ── Face ID / WebAuthn ───────────────────────────────────────────

// Enregistrer une passkey sur l'appareil courant (nécessite d'être connecté)
router.post('/auth/webauthn/register/options', requireProfile, async (req: AuthedRequest, res) => {
  const profile = await Profile.findById(req.profileId)
  if (!profile) return res.status(404).json({ error: 'Profil introuvable' })
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: new TextEncoder().encode(String(profile._id)),
    userName: profile.name,
    attestationType: 'none',
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
    excludeCredentials: profile.webauthnCredentials.map((c) => ({ id: c.credentialId })),
  })
  profile.currentChallenge = options.challenge
  await profile.save()
  res.json(options)
})

router.post('/auth/webauthn/register/verify', requireProfile, async (req: AuthedRequest, res) => {
  const profile = await Profile.findById(req.profileId)
  if (!profile?.currentChallenge) return res.status(400).json({ error: 'Aucune demande en cours' })
  const verification = await verifyRegistrationResponse({
    response: req.body,
    expectedChallenge: profile.currentChallenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
  })
  if (!verification.verified || !verification.registrationInfo)
    return res.status(400).json({ error: 'Échec de l’enregistrement' })
  const { credential } = verification.registrationInfo
  profile.webauthnCredentials.push({
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter,
    deviceLabel: (req.body.deviceLabel as string) || 'Cet appareil',
  })
  profile.currentChallenge = undefined
  await profile.save()
  res.json({ ok: true })
})

// Connexion biométrique
router.post('/auth/webauthn/login/options', async (req, res) => {
  const profile = await Profile.findById(req.body.profileId)
  if (!profile || profile.webauthnCredentials.length === 0)
    return res.status(400).json({ error: 'Aucune passkey pour ce profil' })
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: profile.webauthnCredentials.map((c) => ({ id: c.credentialId })),
    userVerification: 'preferred',
  })
  profile.currentChallenge = options.challenge
  await profile.save()
  res.json(options)
})

router.post('/auth/webauthn/login/verify', async (req, res) => {
  const profile = await Profile.findById(req.body.profileId)
  if (!profile?.currentChallenge) return res.status(400).json({ error: 'Aucune demande en cours' })
  const cred = profile.webauthnCredentials.find((c) => c.credentialId === req.body.response?.id)
  if (!cred) return res.status(400).json({ error: 'Passkey inconnue' })
  const verification = await verifyAuthenticationResponse({
    response: req.body.response,
    expectedChallenge: profile.currentChallenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: cred.credentialId,
      publicKey: new Uint8Array(Buffer.from(cred.publicKey, 'base64url')),
      counter: cred.counter,
    },
  })
  if (!verification.verified) return res.status(401).json({ error: 'Échec de la vérification' })
  cred.counter = verification.authenticationInfo.newCounter
  profile.currentChallenge = undefined
  await profile.save()
  res.json({ token: issueToken(String(profile._id)), profile: publicProfile(profile) })
})

export default router
