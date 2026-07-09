import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AirplaneTilt, ArrowRight, Barbell, Wallet } from '@phosphor-icons/react'
import { api, WEEKDAYS } from '../lib/api'
import { comptesApi, formatEuro } from '../lib/comptes'

export default function Home() {
  const [todayTitle, setTodayTitle] = useState<string | null>(null)
  const [reste, setReste] = useState<number | null>(null)

  useEffect(() => {
    api
      .program()
      .then((program) => {
        const day = program.days.find((d) => d.weekday === new Date().getDay())
        if (day) setTodayTitle(day.title)
      })
      .catch(() => setTodayTitle(null))
    comptesApi
      .summary()
      .then((s) => setReste(s.resteAVivre))
      .catch(() => setReste(null))
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

  return (
    <div className="mx-auto max-w-xl px-5 pt-14 pb-10">
      <header className="rise mb-12" style={{ '--i': 0 } as React.CSSProperties}>
        <p className="font-mono text-[11px] font-medium tracking-[0.25em] text-lime-300/80 uppercase">
          Ton hub perso
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tighter text-white">Salut Lenny</h1>
        <p className="mt-1.5 text-zinc-500">
          {WEEKDAYS[new Date().getDay()]} {today}
        </p>
      </header>

      <Link
        to="/muscu"
        className="rise group block rounded-2xl border border-lime-300/20 bg-gradient-to-br from-lime-300/10 via-zinc-900 to-zinc-900 p-6 transition duration-300 hover:border-lime-300/40 active:scale-[0.98]"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-lime-300/15 text-lime-300">
              <Barbell size={24} weight="fill" />
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">Muscu</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {todayTitle ? (
                <>
                  Aujourd'hui — <span className="font-medium text-lime-300">{todayTitle}</span>
                </>
              ) : (
                'Suivi des séances, kg et reps'
              )}
            </p>
          </div>
          <ArrowRight
            size={22}
            className="shrink-0 text-lime-300 transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </Link>

      <Link
        to="/comptes"
        className="rise group mt-4 block rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-zinc-900 to-zinc-900 p-6 transition duration-300 hover:border-emerald-400/40 active:scale-[0.98]"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <Wallet size={24} weight="fill" />
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">Comptes</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {reste !== null ? (
                <>
                  Reste à vivre — <span className="font-medium text-emerald-300">{formatEuro(reste, false)}</span>
                </>
              ) : (
                'Revenus, abonnements, patrimoine'
              )}
            </p>
          </div>
          <ArrowRight
            size={22}
            className="shrink-0 text-emerald-300 transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </Link>

      <section className="rise mt-12" style={{ '--i': 3 } as React.CSSProperties}>
        <p className="mb-2 font-mono text-[11px] font-medium tracking-[0.25em] text-zinc-600 uppercase">
          À venir
        </p>
        <div className="divide-y divide-zinc-800/80 border-y border-zinc-800/80">
          <div className="flex items-center gap-4 py-4">
            <AirplaneTilt size={20} className="text-zinc-600" />
            <span className="flex-1 font-medium text-zinc-400">Voyage</span>
            <span className="rounded-full border border-zinc-800 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-zinc-600 uppercase">
              Bientôt
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
