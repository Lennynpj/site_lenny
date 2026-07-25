import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Barbell, CalendarBlank, CaretLeft, ChartLineUp, ClockCounterClockwise } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const tabs: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: '/muscu', label: 'Séance', icon: Barbell, end: true },
  { to: '/muscu/programme', label: 'Programme', icon: CalendarBlank },
  { to: '/muscu/historique', label: 'Historique', icon: ClockCounterClockwise },
  { to: '/muscu/progression', label: 'Progression', icon: ChartLineUp },
]

export default function MuscuLayout() {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const { pathname: chemin } = useLocation()
  const indexActif = tabs.findIndex((t) => (t.end ? chemin === t.to : chemin.startsWith(t.to)))

  return (
    <div className="mx-auto min-h-dvh max-w-xl md:max-w-5xl">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
        <div className="flex items-center gap-1 px-3 py-3">
          <Link
            to="/"
            aria-label="Retour au hub"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:text-white active:scale-95"
          >
            <CaretLeft size={20} />
          </Link>
          <h1 className="text-[17px] font-semibold tracking-tight text-white">Muscu</h1>
          <span className="ml-auto pr-2 font-mono text-[11px] tracking-wider text-zinc-600 uppercase">{today}</span>
        </div>
      </header>

      <main className="px-4 pt-5 pb-44">
        <Outlet />
      </main>

      {/* Fondu derrière le dock pour garder le contenu lisible */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

      {/* Dock flottant */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="verre-sombre relative w-full max-w-md rounded-[20px] p-1.5">
          {/* Pastille qui glisse jusqu'à l'onglet actif */}
          {indexActif >= 0 && (
            <span
              aria-hidden="true"
              className="dock-indicateur pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 rounded-[14px] bg-lime-300"
              style={{
                width: 'calc((100% - 0.75rem) / 4)',
                transform: `translateX(calc(${indexActif} * 100%))`,
              }}
            />
          )}

          <div className="relative grid grid-cols-4">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex h-[52px] flex-col items-center justify-center gap-1 rounded-[14px] transition-[color,transform] duration-200 active:scale-95 ${
                    isActive ? 'text-zinc-950' : 'text-zinc-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <tab.icon size={22} weight={isActive ? 'fill' : 'regular'} />
                    <span className="text-[12.5px] leading-none font-semibold whitespace-nowrap">
                      {tab.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
