import { useLayoutEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Barbell, CalendarHeart, CaretLeft, Sparkle } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const onglets: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: '/lysa', label: 'Ma séance', icon: Barbell, end: true },
  { to: '/lysa/programme', label: 'Ma semaine', icon: CalendarHeart },
  { to: '/lysa/progres', label: 'Mes progrès', icon: Sparkle },
]

export default function LysaLayout() {
  // useLayoutEffect : posé avant le premier rendu, sinon on voit une frame
  // sombre en arrivant depuis le hub.
  useLayoutEffect(() => {
    const html = document.documentElement
    const meta = document.querySelector('meta[name="theme-color"]')
    html.classList.add('theme-lysa')
    meta?.setAttribute('content', '#fff6f9')
    return () => {
      html.classList.remove('theme-lysa')
      meta?.setAttribute('content', '#09090b')
    }
  }, [])

  const { pathname: chemin } = useLocation()
  const indexActif = onglets.findIndex((o) => (o.end ? chemin === o.to : chemin.startsWith(o.to)))

  return (
    <div className="min-h-dvh bg-sucre">
      <header className="border-b border-trait-lysa bg-sucre">
        <div className="mx-auto flex max-w-xl items-center gap-2 px-5 py-3 md:max-w-3xl">
          <Link
            to="/"
            aria-label="Retour à l'accueil"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-encre-lysa-2 transition-transform duration-100 active:scale-95"
          >
            <CaretLeft size={22} weight="bold" />
          </Link>
          <span className="font-rond text-[22px] font-bold text-encre-lysa">Lysa</span>
          <span className="ml-auto text-[15px] text-encre-lysa-2">à la maison</span>
        </div>

        {/* Sur grand écran la navigation passe en haut : une barre collée en
            bas d'un écran de PC est loin de la souris. */}
        <nav className="mx-auto hidden max-w-3xl gap-2 px-5 pb-3 md:grid md:grid-cols-3">
          {onglets.map((o) => (
            <NavLink
              key={o.to}
              to={o.to}
              end={o.end}
              className={({ isActive }) =>
                `flex h-14 items-center justify-center gap-2 rounded-[18px] text-[17px] font-semibold transition-colors duration-150 ${
                  isActive ? 'bg-rose text-white' : 'bg-petale text-rose-fonce'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <o.icon size={21} weight={isActive ? 'fill' : 'regular'} />
                  {o.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-xl px-5 pt-6 pb-32 md:max-w-3xl md:pb-12">
        <div key={chemin} className="page-entre">
          <Outlet />
        </div>
      </main>

      {/* Le contenu se fond sous le dock au lieu de passer dessous net */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-sucre via-sucre/85 to-transparent md:hidden" />

      {/* Dock flottant — mobile uniquement */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden">
        <div className="verre-rose relative w-full max-w-md rounded-[26px] p-1.5">
          {indexActif >= 0 && (
            <span
              aria-hidden="true"
              className="dock-indicateur pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 rounded-[20px] bg-rose"
              style={{
                width: 'calc((100% - 0.75rem) / 3)',
                transform: `translateX(calc(${indexActif} * 100%))`,
              }}
            />
          )}
          <div className="relative grid grid-cols-3">
            {onglets.map((o) => (
              <NavLink
                key={o.to}
                to={o.to}
                end={o.end}
                className={({ isActive }) =>
                  `flex h-[56px] flex-col items-center justify-center gap-1 rounded-[20px] transition-[color,transform] duration-200 active:scale-95 ${
                    isActive ? 'text-white' : 'text-encre-lysa-2'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <o.icon size={23} weight={isActive ? 'fill' : 'regular'} />
                    <span className="text-[12.5px] leading-none font-semibold whitespace-nowrap">
                      {o.label}
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
