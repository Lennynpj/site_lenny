import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretRight, Heart } from '@phosphor-icons/react'
import { apiLysa, WEEKDAYS } from '../../lib/api'
import type { Exercise, Program } from '../../lib/types'
import { BoutonRose, MessageErreur, Squelette, TitreSection } from './components/ui'
import DemoExercice from './components/DemoExercice'
import Picto from './components/Picto'

const ORDRE = [1, 2, 3, 4, 5, 6, 0]

export default function ProgrammePage() {
  const naviguer = useNavigate()
  const [programme, setProgramme] = useState<Program | null>(null)
  const [exercices, setExercices] = useState<Record<string, Exercise>>({})
  const [erreur, setErreur] = useState<string | null>(null)
  const [demo, setDemo] = useState<Exercise | null>(null)
  const aujourdhui = new Date().getDay()

  useEffect(() => {
    Promise.all([apiLysa.program(), apiLysa.exercises()])
      .then(([p, exos]) => {
        setProgramme(p)
        setExercices(Object.fromEntries(exos.map((e) => [e.slug, e])))
      })
      .catch((e) => setErreur(e instanceof Error ? e.message : 'Erreur'))
  }, [])

  if (erreur) return <MessageErreur texte={erreur} onReessayer={() => location.reload()} />
  if (!programme) return <Squelette hauteur="h-36" nombre={3} />

  const jours = ORDRE.map((wd) => programme.days.find((d) => d.weekday === wd)).filter(
    (d): d is NonNullable<typeof d> => !!d
  )

  return (
    <div>
      <h1 className="font-rond rise text-[30px] font-bold text-encre-lysa">Ma semaine</h1>
      <p className="mt-1 text-[17px] text-encre-lysa-2">
        Trois séances, tout à la maison. Les deux jours de jambes ne se suivent jamais.
      </p>

      <div className="mt-6 space-y-5">
        {jours.map((jour, i) => {
          const lignes = jour.blocks.flatMap((b) => b.items)
          const cest = jour.weekday === aujourdhui
          if (jour.type !== 'muscu' || lignes.length === 0) {
            return (
              <div
                key={jour.weekday}
                className="rise flex items-center gap-3 rounded-bonbon bg-petale-2 px-5 py-4"
                style={{ '--i': i } as React.CSSProperties}
              >
                <Heart size={20} weight="fill" className="shrink-0 text-rose" />
                <span className="text-[17px] font-semibold text-encre-lysa">{WEEKDAYS[jour.weekday]}</span>
                <span className="ml-auto text-[16px] text-encre-lysa-2">Repos</span>
              </div>
            )
          }
          return (
            <section
              key={jour.weekday}
              className="rise carte-bonbon rounded-bonbon overflow-hidden"
              style={{ '--i': i } as React.CSSProperties}
            >
              <div className={`px-5 py-4 ${cest ? 'bg-rose text-white' : 'bg-petale-2'}`}>
                <p className={`text-[14px] font-bold ${cest ? 'text-white/85' : 'text-rose-fonce'}`}>
                  {WEEKDAYS[jour.weekday]}
                  {cest && ' · aujourd’hui'}
                </p>
                <h2 className={`font-rond text-[23px] font-bold ${cest ? 'text-white' : 'text-encre-lysa'}`}>
                  {jour.title}
                </h2>
              </div>

              <ul className="divide-y divide-trait-lysa">
                {lignes.map((it, j) => {
                  const exo = exercices[it.exerciseSlug]
                  return (
                    <li key={j}>
                      <button
                        onClick={() => exo && setDemo(exo)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-100 active:bg-petale-2"
                      >
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-petale-2">
                          <Picto pattern={exo?.pattern} className="h-11 w-11" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[17px] font-semibold text-encre-lysa">
                            {exo?.name ?? it.exerciseSlug}
                          </span>
                          <span className="block text-[15px] text-encre-lysa-2">
                            {it.sets} séries
                            {it.repsMin ? ` · ${it.repsMin}${it.repsMax && it.repsMax !== it.repsMin ? `-${it.repsMax}` : ''}` : ''}
                            {exo?.unit === 'secondes' ? ' sec' : ''}
                            {exo?.unit === 'parJambe' ? ' / jambe' : ''}
                            {exo?.unit === 'parBras' ? ' / bras' : ''}
                            {exo?.unit === 'parCote' ? ' / côté' : ''}
                          </span>
                        </span>
                        <CaretRight size={18} weight="bold" className="shrink-0 text-encre-lysa-2" />
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="p-4">
                <BoutonRose onClick={() => naviguer(cest ? '/lysa' : `/lysa?jour=${jour.weekday}`)}>
                  {cest ? 'Commencer la séance' : 'Faire cette séance'}
                </BoutonRose>
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-8">
        <TitreSection>Comment progresser</TitreSection>
        <div className="carte-bonbon rounded-bonbon space-y-3 p-5 text-[17px] leading-snug text-encre-lysa">
          <p>
            Avec des haltères de 10 kg, on ne peut pas ajouter du poids indéfiniment. Alors on rend
            l’exercice plus dur autrement, dans cet ordre :
          </p>
          <ol className="space-y-2">
            {[
              'Ajoute des répétitions jusqu’en haut de la fourchette.',
              'Ajoute une série.',
              'Ralentis la descente : compte 3 secondes.',
              'Marque une pause d’une seconde en bas.',
              'Raccourcis le repos.',
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-rond grid h-7 w-7 shrink-0 place-items-center rounded-full bg-petale text-[15px] font-bold text-rose-fonce">
                  {i + 1}
                </span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {demo && <DemoExercice exercice={demo} ouverte onFermer={() => setDemo(null)} />}
    </div>
  )
}
