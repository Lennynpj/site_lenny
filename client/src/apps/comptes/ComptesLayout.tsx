import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  CaretLeft,
  ChartLineUp,
  Coins,
  ArrowsClockwise,
  FingerprintSimple,
  SignOut,
  SquaresFour,
  Wallet,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { authApi, clearToken, getToken } from '../../lib/comptes'
import type { ProfilePublic } from '../../lib/comptes'
import ProfileGate from './ProfileGate'
import { PrimaryButton, Sheet } from './components/ui'

const tabs: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: '/comptes', label: 'Bord', icon: SquaresFour, end: true },
  { to: '/comptes/abonnements', label: 'Abos', icon: ArrowsClockwise },
  { to: '/comptes/revenus', label: 'Revenus', icon: Coins },
  { to: '/comptes/patrimoine', label: 'Patrimoine', icon: Wallet },
  { to: '/comptes/projection', label: 'Projection', icon: ChartLineUp },
]

export default function ComptesLayout() {
  // undefined = en cours de vérif, null = non connecté, objet = connecté
  const [profile, setProfile] = useState<ProfilePublic | null | undefined>(undefined)

  useEffect(() => {
    if (!getToken()) return setProfile(null)
    authApi.me().then(setProfile).catch(() => setProfile(null))
  }, [])

  if (profile === undefined) {
    return <div className="mx-auto min-h-dvh max-w-xl px-4 pt-16"><div className="skeleton h-40 rounded-3xl" /></div>
  }
  if (profile === null) {
    return <ProfileGate onAuthed={setProfile} />
  }

  return <AuthedLayout profile={profile} onLogout={() => { clearToken(); setProfile(null) }} />
}

function AuthedLayout({ profile, onLogout }: { profile: ProfilePublic; onLogout: () => void }) {
  const [menu, setMenu] = useState(false)

  return (
    <div className="mx-auto min-h-dvh max-w-xl">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
        <div className="flex items-center gap-1 px-3 py-3">
          <Link
            to="/"
            aria-label="Retour au hub"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:text-white active:scale-95"
          >
            <CaretLeft size={20} />
          </Link>
          <h1 className="text-[17px] font-semibold tracking-tight text-white">Comptes</h1>
          <button
            onClick={() => setMenu(true)}
            className="ml-auto flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 py-1 pr-3 pl-1 transition active:scale-95"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-zinc-950"
              style={{ backgroundColor: profile.avatarColor }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-zinc-200">{profile.name}</span>
          </button>
        </div>
      </header>

      <main className="px-4 pt-5 pb-32">
        <Outlet />
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/10 bg-zinc-900/75 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              aria-label={tab.label}
              className={({ isActive }) =>
                `flex h-11 items-center rounded-full transition-all duration-300 active:scale-95 ${
                  isActive ? 'bg-emerald-400 px-3.5 text-zinc-950' : 'px-2.5 text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  <span
                    className={`overflow-hidden text-[13px] font-semibold whitespace-nowrap transition-all duration-300 ${
                      isActive ? 'ml-1.5 max-w-28 opacity-100' : 'ml-0 max-w-0 opacity-0'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <ProfileMenu open={menu} onClose={() => setMenu(false)} profile={profile} onLogout={onLogout} />
    </div>
  )
}

function ProfileMenu({
  open,
  onClose,
  profile,
  onLogout,
}: {
  open: boolean
  onClose: () => void
  profile: ProfilePublic
  onLogout: () => void
}) {
  const [faceIdOn, setFaceIdOn] = useState(profile.hasFaceId)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function enableFaceId() {
    setBusy(true)
    setMsg(null)
    try {
      await authApi.registerFaceId()
      setFaceIdOn(true)
      setMsg('Face ID activé sur cet appareil ✓')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Échec')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={profile.name}>
      <div className="space-y-3">
        {authApi.faceIdSupported() ? (
          faceIdOn ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              <FingerprintSimple size={18} weight="fill" /> Face ID actif sur cet appareil
            </div>
          ) : (
            <button
              onClick={enableFaceId}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3.5 text-left transition hover:border-zinc-600 disabled:opacity-50"
            >
              <FingerprintSimple size={20} className="text-emerald-300" />
              <span className="flex-1">
                <span className="block text-sm font-medium text-white">Activer Face ID</span>
                <span className="block text-xs text-zinc-500">Déverrouille ce profil sans mot de passe</span>
              </span>
            </button>
          )
        ) : (
          <p className="rounded-xl bg-zinc-800/40 px-4 py-3 text-xs text-zinc-500">
            Face ID n'est disponible qu'en HTTPS (sur le site en ligne) et sur un appareil compatible.
          </p>
        )}

        {msg && <p className="text-sm text-zinc-300">{msg}</p>}

        <PrimaryButton onClick={onLogout} className="!bg-zinc-800 !text-white">
          <SignOut size={18} /> Changer de profil
        </PrimaryButton>
      </div>
    </Sheet>
  )
}
