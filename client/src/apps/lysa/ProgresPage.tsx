import { useEffect, useState } from 'react'
import { CalendarCheck, Sparkle, TrashSimple } from '@phosphor-icons/react'
import { apiLysa } from '../../lib/api'
import type { WorkoutSession } from '../../lib/types'
import { Carte, MessageErreur, Squelette, TitreSection } from './components/ui'

function jolieDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function ProgresPage() {
  const [seances, setSeances] = useState<WorkoutSession[] | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  const charger = () =>
    apiLysa
      .sessions(40)
      .then(setSeances)
      .catch((e) => setErreur(e instanceof Error ? e.message : 'Erreur'))

  useEffect(() => {
    charger()
  }, [])

  if (erreur) return <MessageErreur texte={erreur} onReessayer={charger} />
  if (!seances) return <Squelette hauteur="h-28" nombre={3} />

  const maintenant = new Date()
  const ceMois = seances.filter((s) => {
    const d = new Date(s.date)
    return d.getMonth() === maintenant.getMonth() && d.getFullYear() === maintenant.getFullYear()
  })
  const seriesTotal = seances.reduce(
    (n, s) => n + s.entries.reduce((m, e) => m + e.sets.filter((x) => x.done).length, 0),
    0
  )

  return (
    <div>
      <h1 className="font-rond rise text-[30px] font-bold text-encre-lysa">Mes progrès</h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Carte className="text-center">
          <p className="font-rond text-[40px] leading-none font-bold text-rose tabular-nums">
            {ceMois.length}
          </p>
          <p className="mt-1.5 text-[15px] text-encre-lysa-2">
            séance{ceMois.length > 1 ? 's' : ''} ce mois-ci
          </p>
        </Carte>
        <Carte className="text-center">
          <p className="font-rond text-[40px] leading-none font-bold text-rose tabular-nums">
            {seriesTotal}
          </p>
          <p className="mt-1.5 text-[15px] text-encre-lysa-2">séries au total</p>
        </Carte>
      </div>

      <div className="mt-8">
        <TitreSection>Ce que j'ai fait</TitreSection>

        {seances.length === 0 ? (
          <div className="carte-bonbon rounded-bonbon px-6 py-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-petale text-rose">
              <Sparkle size={30} weight="fill" />
            </span>
            <p className="font-rond mt-4 text-[20px] font-bold text-encre-lysa">Rien encore</p>
            <p className="mx-auto mt-1.5 max-w-[30ch] text-[16px] text-encre-lysa-2">
              Ta première séance apparaîtra ici, avec tout ce que tu auras soulevé.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {seances.map((s, i) => {
              const faites = s.entries.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0)
              return (
                <li
                  key={s._id}
                  className="rise carte-bonbon rounded-bonbon p-4"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-petale text-rose">
                      <CalendarCheck size={21} weight="fill" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-rond text-[19px] font-bold text-encre-lysa">{s.title}</p>
                      <p className="text-[15px] text-encre-lysa-2 first-letter:uppercase">
                        {jolieDate(s.date)} · {faites} séries
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!s._id) return
                        await apiLysa.deleteSession(s._id)
                        charger()
                      }}
                      aria-label={`Supprimer la séance du ${jolieDate(s.date)}`}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-encre-lysa-2 transition-transform duration-100 active:scale-95"
                    >
                      <TrashSimple size={18} />
                    </button>
                  </div>

                  <ul className="mt-3 space-y-1.5 border-t border-trait-lysa pt-3">
                    {s.entries
                      .filter((e) => e.sets.some((x) => x.done))
                      .map((e, j) => (
                        <li key={j} className="flex justify-between gap-3 text-[16px]">
                          <span className="min-w-0 truncate text-encre-lysa">{e.exerciseName}</span>
                          <span className="shrink-0 text-encre-lysa-2 tabular-nums">
                            {e.sets
                              .filter((x) => x.done)
                              .map((x) => (x.weight ? `${x.weight}×${x.reps}` : `${x.reps}`))
                              .join(' · ')}
                          </span>
                        </li>
                      ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
