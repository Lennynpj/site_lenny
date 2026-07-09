import { useEffect, useState } from 'react'
import { CaretLeft, FingerprintSimple, Plus, Wallet } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { authApi, setToken } from '../../lib/comptes'
import type { ProfilePublic } from '../../lib/comptes'
import { Field, PrimaryButton, TextInput } from './components/ui'

const AVATARS = ['#34d399', '#f472b6', '#60a5fa', '#f59e0b', '#c084fc', '#22d3ee']

/** Portail : choix du profil → mot de passe / Face ID, ou création de profil. */
export default function ProfileGate({ onAuthed }: { onAuthed: (p: ProfilePublic) => void }) {
  const [profiles, setProfiles] = useState<ProfilePublic[] | null>(null)
  const [selected, setSelected] = useState<ProfilePublic | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => authApi.profiles().then(setProfiles).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  function authed(token: string, p: ProfilePublic) {
    setToken(token)
    onAuthed(p)
  }

  return (
    <div className="mx-auto min-h-dvh max-w-xl px-5 pt-14 pb-10">
      <Link to="/" className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <CaretLeft size={16} /> Hub
      </Link>

      <header className="mb-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
          <Wallet size={26} weight="fill" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tighter text-white">Comptes</h1>
        <p className="mt-1 text-zinc-500">
          {creating ? 'Créer un profil' : selected ? `Bonjour ${selected.name}` : 'Qui es-tu ?'}
        </p>
      </header>

      {error && !profiles && <p className="text-sm text-red-400">{error}</p>}

      {creating || (profiles && profiles.length === 0) ? (
        <CreateProfile onDone={authed} onCancel={profiles && profiles.length > 0 ? () => setCreating(false) : undefined} />
      ) : selected ? (
        <LoginProfile profile={selected} onAuthed={authed} onBack={() => setSelected(null)} />
      ) : (
        <div className="space-y-3">
          {profiles?.map((p, i) => (
            <button
              key={p._id}
              onClick={() => setSelected(p)}
              className="rise flex w-full items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-4 text-left transition hover:border-zinc-700 active:scale-[0.99]"
              style={{ '--i': i } as React.CSSProperties}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-zinc-950"
                style={{ backgroundColor: p.avatarColor }}
              >
                {p.name.charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 font-semibold text-white">{p.name}</span>
              {p.hasFaceId && <FingerprintSimple size={18} className="text-emerald-300" />}
            </button>
          ))}
          {profiles && profiles.length < 5 && (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 py-4 text-sm font-medium text-zinc-400 transition hover:border-zinc-500 active:scale-[0.99]"
            >
              <Plus size={16} weight="bold" /> Nouveau profil
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function LoginProfile({
  profile,
  onAuthed,
  onBack,
}: {
  profile: ProfilePublic
  onAuthed: (token: string, p: ProfilePublic) => void
  onBack: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function loginPassword() {
    setBusy(true)
    setError(null)
    try {
      const { token, profile: p } = await authApi.login(profile._id, password)
      onAuthed(token, p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  async function loginFaceId() {
    setBusy(true)
    setError(null)
    try {
      const { token, profile: p } = await authApi.loginFaceId(profile._id)
      onAuthed(token, p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec Face ID')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-zinc-950"
          style={{ backgroundColor: profile.avatarColor }}
        >
          {profile.name.charAt(0).toUpperCase()}
        </span>
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-white">
          ← changer de profil
        </button>
      </div>

      {profile.hasFaceId && authApi.faceIdSupported() && (
        <button
          onClick={loginFaceId}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 py-3.5 font-semibold text-emerald-300 transition active:scale-[0.98] disabled:opacity-50"
        >
          <FingerprintSimple size={20} weight="fill" /> Déverrouiller avec Face ID
        </button>
      )}

      <Field label="Mot de passe">
        <TextInput
          type="password"
          inputMode="numeric"
          autoFocus
          value={password}
          placeholder="••••"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && password && loginPassword()}
        />
      </Field>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <PrimaryButton onClick={loginPassword} disabled={busy || !password}>
        {busy ? '…' : 'Se connecter'}
      </PrimaryButton>
    </div>
  )
}

function CreateProfile({
  onDone,
  onCancel,
}: {
  onDone: (token: string, p: ProfilePublic) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [color, setColor] = useState(AVATARS[0])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function create() {
    if (!name || password.length < 4) {
      setError('Nom et mot de passe (min. 4 caractères) requis')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { token, profile } = await authApi.createProfile(name, password, color)
      onDone(token, profile)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Field label="Prénom">
        <TextInput value={name} placeholder="Ex. Lenny" autoFocus onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Mot de passe (min. 4)">
        <TextInput
          type="password"
          inputMode="numeric"
          value={password}
          placeholder="••••"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Field label="Couleur">
        <div className="flex gap-2">
          {AVATARS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Couleur ${c}`}
              className={`h-9 w-9 rounded-full transition ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </Field>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <PrimaryButton onClick={create} disabled={busy || !name || password.length < 4}>
        {busy ? '…' : 'Créer mon profil'}
      </PrimaryButton>
      {onCancel && (
        <button onClick={onCancel} className="w-full text-center text-sm text-zinc-400 hover:text-white">
          Annuler
        </button>
      )}
    </div>
  )
}
