import { useEffect, useLayoutEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CalendarBlank, House, PiggyBank, Receipt } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { authApi, clearToken, getToken } from '../../lib/comptes'
import type { ProfilePublic } from '../../lib/comptes'
import AccesGate from './AccesGate'
import { Squelette } from './components/ui'

// « labelLong » sur PC (place disponible), mot court mais entier sur mobile —
// jamais d'abréviation.
const onglets: { to: string; label: string; labelLong: string; icon: Icon; end?: boolean }[] = [
  { to: '/comptes', label: 'Accueil', labelLong: 'Accueil', icon: House, end: true },
  { to: '/comptes/mois', label: 'Mon mois', labelLong: 'Mon mois', icon: CalendarBlank },
  { to: '/comptes/depenses', label: 'Dépenses', labelLong: 'Mes dépenses', icon: Receipt },
  { to: '/comptes/epargne', label: 'Épargne', labelLong: 'Mon épargne', icon: PiggyBank },
]

export default function ComptesLayout() {
  // useLayoutEffect (et non useEffect) : s'exécute avant le paint, donc aucune
  // frame sombre quand on arrive depuis le hub.
  useLayoutEffect(() => {
    const html = document.documentElement
    const meta = document.querySelector('meta[name="theme-color"]')
    html.classList.add('theme-clair')
    meta?.setAttribute('content', '#ffffff')
    // Réapplique le réglage « texte plus grand » choisi dans Réglages.
    if (localStorage.getItem('comptes_texte_grand') === '1') html.style.fontSize = '21px'
    return () => {
      html.classList.remove('theme-clair')
      html.style.fontSize = ''
      meta?.setAttribute('content', '#09090b')
    }
  }, [])

  // undefined = vérification en cours, null = pas connectée
  const [profil, setProfil] = useState<ProfilePublic | null | undefined>(undefined)
  const [sessionExpiree, setSessionExpiree] = useState(false)

  useEffect(() => {
    if (!getToken()) return setProfil(null)
    authApi
      .me()
      .then(setProfil)
      .catch(() => {
        // On ne la renvoie jamais à l'écran de code sans explication.
        setSessionExpiree(true)
        setProfil(null)
      })
  }, [])

  if (profil === undefined) {
    return (
      <div className="mx-auto min-h-dvh max-w-xl px-5 pt-16">
        <Squelette hauteur="h-44" nombre={1} />
      </div>
    )
  }

  if (profil === null) {
    return (
      <AccesGate
        sessionExpiree={sessionExpiree}
        onEntree={(p) => {
          setSessionExpiree(false)
          setProfil(p)
        }}
      />
    )
  }

  return (
    <ConnecteeLayout
      profil={profil}
      onQuitter={() => {
        clearToken()
        setProfil(null)
      }}
    />
  )
}

function ConnecteeLayout({
  profil,
  onQuitter,
}: {
  profil: ProfilePublic
  onQuitter: () => void
}) {
  return (
    <div className="min-h-dvh bg-papier">
      <header className="border-b border-trait bg-papier">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-5 py-3 md:max-w-3xl">
          <span className="text-titre-section font-bold tracking-tight text-encre">Mes comptes</span>
          <NavLink
            to="/comptes/reglages"
            className="flex h-14 items-center gap-2.5 rounded-champ border border-trait px-3 transition-colors duration-100 hover:bg-papier-2"
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-corps font-bold text-papier"
              style={{ backgroundColor: profil.avatarColor }}
            >
              {profil.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-corps font-medium text-encre">{profil.name}</span>
          </NavLink>
        </div>

        {/* Sur PC la navigation passe en haut : une barre fixée en bas d'un
            grand écran est loin de la souris et déroutante. */}
        <nav className="mx-auto hidden max-w-3xl gap-2 px-5 pb-3 md:grid md:grid-cols-4">
          {onglets.map((o) => (
            <NavLink
              key={o.to}
              to={o.to}
              end={o.end}
              className={({ isActive }) =>
                `flex h-14 items-center justify-center gap-2 rounded-champ text-corps font-semibold transition-colors duration-100 ${
                  isActive ? 'bg-bleu text-papier' : 'border border-trait text-encre-2 hover:bg-papier-2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <o.icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  {o.labelLong}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-xl px-5 pt-6 pb-28 md:max-w-3xl md:pb-12">
        <Outlet context={{ profil, onQuitter }} />
      </main>

      {/* Barre du bas — mobile uniquement. Libellés TOUJOURS visibles. */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-trait bg-papier pb-[env(safe-area-inset-bottom)] md:hidden">
        {onglets.map((o) => (
          <NavLink
            key={o.to}
            to={o.to}
            end={o.end}
            className={({ isActive }) =>
              `flex h-16 flex-col items-center justify-center gap-0.5 transition-colors duration-100 ${
                isActive ? 'text-bleu' : 'text-encre-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <o.icon size={25} weight={isActive ? 'fill' : 'regular'} />
                <span className="text-[15px] leading-none font-semibold whitespace-nowrap">
                  {o.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
