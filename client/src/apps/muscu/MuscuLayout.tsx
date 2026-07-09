import { Link, NavLink, Outlet } from 'react-router-dom'
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
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900/75 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              aria-label={tab.label}
              className={({ isActive }) =>
                `flex h-11 items-center rounded-full transition-all duration-300 active:scale-95 ${
                  isActive
                    ? 'bg-lime-300 px-4 text-zinc-950'
                    : 'px-3 text-zinc-500 hover:text-zinc-300'
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
    </div>
  )
}
