import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Confetti,
  Heart,
  Pause,
  Play,
  Question,
  SkipForward,
} from '@phosphor-icons/react'
import { apiLysa, WEEKDAYS } from '../../lib/api'
import type { Exercise, ProgramItem, SetEntry, WorkoutSession } from '../../lib/types'
import { BoutonDoux, BoutonRose, MessageErreur, Squelette } from './components/ui'
import Compteur from './components/Compteur'
import DemoExercice from './components/DemoExercice'
import Vignette from './components/Vignette'

/* La séance, un exercice à la fois.
   Le côté de Lenny empile toute la séance dans une longue page : on scrolle
   entre chaque série, on retape le poids à la main, et le minuteur de repos
   se perd en haut de l'écran. Ici l'écran ne montre qu'une chose : la série
   en cours. Un seul geste la valide, le repos prend l'écran, et l'exercice
   suivant arrive tout seul. */

type Ligne = ProgramItem & { circuit: boolean }

const REPOS_PAR_DEFAUT = 90
const REPOS_ABDOS = 45

function mmss(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** « 12 à 15 », « 10 par jambe », « 30 à 45 secondes »… */
function objectif(item: ProgramItem, exo?: Exercise) {
  const u = exo?.unit ?? 'reps'
  if (u === 'max') return 'le maximum'
  const n =
    item.repsMax && item.repsMax !== item.repsMin
      ? `${item.repsMin} à ${item.repsMax}`
      : `${item.repsMin}`
  if (u === 'secondes') return `${n} secondes`
  if (u === 'parJambe') return `${n} par jambe`
  if (u === 'parBras') return `${n} par bras`
  if (u === 'parCote') return `${n} de chaque côté`
  return `${n} répétitions`
}

export default function SeancePage() {
  const naviguer = useNavigate()
  /* Par défaut la séance du jour, mais on peut en ouvrir une autre : si elle
     rate le lundi, elle doit pouvoir le faire le mardi sans se battre. */
  const [parametres] = useSearchParams()
  const [exercices, setExercices] = useState<Record<string, Exercise>>({})
  const [jour, setJour] = useState<{ weekday: number; title: string; type: string; lignes: Ligne[] } | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  const [index, setIndex] = useState(0)
  const [saisie, setSaisie] = useState<Record<string, SetEntry[]>>({})
  const [demo, setDemo] = useState<Exercise | null>(null)
  const [terminee, setTerminee] = useState(false)
  const [enregistrement, setEnregistrement] = useState(false)

  // Repos : une fin d'échéance, pas un compteur qui dérive
  const [reposFin, setReposFin] = useState<number | null>(null)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  // Chrono de gainage (exercices comptés en secondes)
  const [chronoDebut, setChronoDebut] = useState<number | null>(null)

  const jourDemande = Number(parametres.get('jour'))
  useEffect(() => {
    const aujourdhui = Number.isInteger(jourDemande) && jourDemande >= 0 && jourDemande <= 6
      ? jourDemande
      : new Date().getDay()
    Promise.all([apiLysa.program(), apiLysa.exercises(), apiLysa.lastPerf()])
      .then(([prog, exos, perf]) => {
        const parSlug = Object.fromEntries(exos.map((e) => [e.slug, e]))
        setExercices(parSlug)
        const d = prog.days.find((x) => x.weekday === aujourdhui)
        const lignes: Ligne[] =
          d?.blocks.flatMap((b) => b.items.map((it) => ({ ...it, circuit: b.type === 'circuit' }))) ?? []
        setJour(d ? { weekday: d.weekday, title: d.title, type: d.type, lignes } : null)

        // Pré-remplissage : ce qu'elle a fait la dernière fois, sinon le bas
        // de la fourchette. Elle n'a jamais à taper un nombre de zéro.
        const depart: Record<string, SetEntry[]> = {}
        for (const it of lignes) {
          const exo = parSlug[it.exerciseSlug]
          const dernier = perf[it.exerciseSlug]
          const poidsDefaut = exo?.equipment === 'poids du corps' ? 0 : 10
          depart[it.exerciseSlug] = Array.from({ length: it.sets }, (_, i) => ({
            weight: dernier?.sets[i]?.weight ?? dernier?.sets.at(-1)?.weight ?? poidsDefaut,
            reps: dernier?.sets[i]?.reps ?? dernier?.sets.at(-1)?.reps ?? it.repsMin ?? 10,
            done: false,
          }))
        }
        setSaisie(depart)
      })
      .catch((e) => setErreur(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setChargement(false))
  }, [jourDemande])

  useEffect(() => {
    if (!reposFin && !chronoDebut) return
    const id = setInterval(() => setMaintenant(Date.now()), 250)
    return () => clearInterval(id)
  }, [reposFin, chronoDebut])

  const reposRestant = reposFin ? Math.max(0, Math.ceil((reposFin - maintenant) / 1000)) : 0
  useEffect(() => {
    if (reposFin && reposRestant === 0) setReposFin(null)
  }, [reposFin, reposRestant])

  const ligne = jour?.lignes[index]
  const exo = ligne ? exercices[ligne.exerciseSlug] : undefined
  const series = ligne ? (saisie[ligne.exerciseSlug] ?? []) : []
  const iSerie = Math.max(0, series.findIndex((s) => !s.done))
  const serie = series[iSerie]
  const unite = exo?.unit ?? 'reps'
  const sansPoids = exo?.equipment === 'poids du corps'

  const majSerie = useCallback(
    (patch: Partial<SetEntry>) => {
      if (!ligne) return
      setSaisie((p) => ({
        ...p,
        [ligne.exerciseSlug]: p[ligne.exerciseSlug].map((s, i) => (i === iSerie ? { ...s, ...patch } : s)),
      }))
    },
    [ligne, iSerie]
  )

  const total = jour?.lignes.reduce((n, l) => n + l.sets, 0) ?? 0
  const faites = Object.values(saisie).flat().filter((s) => s.done).length

  function validerSerie() {
    if (!ligne) return
    setChronoDebut(null)
    const derniereDuGroupe = iSerie >= series.length - 1
    const dernierExo = index >= (jour?.lignes.length ?? 0) - 1
    setSaisie((p) => ({
      ...p,
      [ligne.exerciseSlug]: p[ligne.exerciseSlug].map((s, i) => (i === iSerie ? { ...s, done: true } : s)),
    }))
    if (derniereDuGroupe && dernierExo) {
      setTerminee(true)
      return
    }
    if (derniereDuGroupe) setIndex((n) => n + 1)
    setMaintenant(Date.now())
    setReposFin(Date.now() + (ligne.circuit ? REPOS_ABDOS : REPOS_PAR_DEFAUT) * 1000)
  }

  async function enregistrer() {
    if (!jour) return
    setEnregistrement(true)
    try {
      const seance: WorkoutSession = {
        date: new Date().toISOString(),
        weekday: jour.weekday,
        title: jour.title,
        entries: jour.lignes.map((l) => ({
          exerciseSlug: l.exerciseSlug,
          exerciseName: exercices[l.exerciseSlug]?.name,
          targetSets: l.sets,
          repsMin: l.repsMin,
          repsMax: l.repsMax,
          sets: saisie[l.exerciseSlug] ?? [],
        })),
      }
      await apiLysa.createSession(seance)
      naviguer('/lysa/progres')
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur')
      setEnregistrement(false)
    }
  }

  const secondesTenues = chronoDebut ? Math.floor((maintenant - chronoDebut) / 1000) : 0
  const objectifTexte = useMemo(() => (ligne ? objectif(ligne, exo) : ''), [ligne, exo])

  if (chargement) return <Squelette hauteur="h-40" nombre={3} />
  if (erreur && !jour) return <MessageErreur texte={erreur} onReessayer={() => location.reload()} />

  // ── Jour de repos ────────────────────────────────────────────────
  if (!jour || jour.type !== 'muscu' || jour.lignes.length === 0) {
    return (
      <div className="rise py-6 text-center">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-petale text-rose">
          <Heart size={44} weight="fill" />
        </span>
        <h1 className="font-rond mt-5 text-[30px] font-bold text-encre-lysa">
          {jourDemande || jourDemande === 0 ? 'Pas de séance ce jour-là' : 'Repos aujourd’hui'}
        </h1>
        <p className="mx-auto mt-2 max-w-[30ch] text-[17px] text-encre-lysa-2">
          C'est pendant le repos que les muscles se construisent, pas pendant la séance. Tu peux
          quand même faire une séance depuis ta semaine.
        </p>
        <div className="mx-auto mt-7 max-w-xs">
          <BoutonDoux onClick={() => naviguer('/lysa/programme')}>Voir ma semaine</BoutonDoux>
        </div>
      </div>
    )
  }

  // Garde-fou : un index hors bornes ne devrait pas arriver, mais mieux vaut
  // un message qu'un écran blanc.
  if (!ligne) return <MessageErreur texte="Cette séance ne contient aucun exercice." />

  // ── Séance terminée ──────────────────────────────────────────────
  if (terminee) {
    return (
      <div className="rise py-6 text-center">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-petale text-rose">
          <Confetti size={44} weight="fill" />
        </span>
        <h1 className="font-rond mt-5 text-[30px] font-bold text-encre-lysa">Séance terminée</h1>
        <p className="mt-2 text-[17px] text-encre-lysa-2">
          {faites} séries, {jour.lignes.length} exercices. Bravo.
        </p>
        {erreur && (
          <div className="mt-5 text-left">
            <MessageErreur texte={erreur} />
          </div>
        )}
        <div className="mx-auto mt-7 max-w-xs space-y-2.5">
          <BoutonRose onClick={enregistrer} disabled={enregistrement}>
            {enregistrement ? 'Un instant…' : 'Enregistrer ma séance'}
          </BoutonRose>
          <BoutonDoux onClick={() => setTerminee(false)}>Revenir à la séance</BoutonDoux>
        </div>
      </div>
    )
  }

  // ── Repos : il prend tout l'écran, impossible de le rater ────────
  if (reposFin) {
    const totalRepos = ligne.circuit ? REPOS_ABDOS : REPOS_PAR_DEFAUT
    const part = reposRestant / totalRepos
    const suivante = series[iSerie]
      ? `Série ${iSerie + 1} sur ${series.length}`
      : 'Exercice suivant'
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
        <p className="text-[18px] font-semibold text-rose-fonce">Repos</p>
        <div className="relative mt-4 grid h-56 w-56 place-items-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-petale)" strokeWidth="11" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="var(--color-rose)" strokeWidth="11" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - part)}
              style={{ transition: 'stroke-dashoffset 0.25s linear' }}
            />
          </svg>
          <span className="font-rond text-[52px] font-bold text-encre-lysa tabular-nums">
            {mmss(reposRestant)}
          </span>
        </div>
        <p className="mt-5 text-[19px] font-semibold text-encre-lysa">{exercices[ligne.exerciseSlug]?.name}</p>
        <p className="mt-1 text-[16px] text-encre-lysa-2">{suivante}</p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
          <BoutonRose onClick={() => setReposFin(null)}>Je reprends</BoutonRose>
          <BoutonDoux onClick={() => setReposFin((f) => (f ?? Date.now()) + 30_000)}>
            + 30 secondes
          </BoutonDoux>
        </div>
      </div>
    )
  }

  // ── L'exercice en cours ──────────────────────────────────────────
  return (
    <div>
      {/* Où elle en est dans la séance */}
      <div className="mb-4">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="font-rond text-[15px] font-bold text-rose-fonce">
            {WEEKDAYS[jour.weekday]} · {jour.title}
          </p>
          <p className="text-[15px] text-encre-lysa-2 tabular-nums">
            {index + 1} / {jour.lignes.length}
          </p>
        </div>
        <div className="flex gap-1">
          {jour.lignes.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < index ? 'bg-rose' : i === index ? 'bg-rose/50' : 'bg-petale'
              }`}
            />
          ))}
        </div>
      </div>

      {/* L'exercice */}
      <div key={ligne.exerciseSlug} className="rise carte-bonbon rounded-bonbon p-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => exo && setDemo(exo)}
            aria-label={`Montre-moi : ${exo?.name}`}
            className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[22px] bg-petale-2 transition-transform duration-100 active:scale-95"
          >
            {exo && <Vignette exercice={exo} className="h-full w-full rounded-[22px]" />}
          </button>
          <div className="min-w-0 flex-1">
            {ligne.circuit && (
              <span className="mb-1 inline-block rounded-full bg-petale px-2.5 py-1 text-[13px] font-bold text-rose-fonce">
                Abdos
              </span>
            )}
            <h1 className="font-rond text-[24px] leading-tight font-bold text-encre-lysa">
              {exo?.name ?? ligne.exerciseSlug}
            </h1>
            <p className="mt-0.5 text-[16px] text-encre-lysa-2">{objectifTexte}</p>
            <button
              onClick={() => exo && setDemo(exo)}
              className="mt-2 flex h-11 items-center gap-1.5 rounded-full bg-petale px-3.5 text-[15px] font-bold text-rose-fonce transition-transform duration-100 active:scale-95"
            >
              <Question size={17} weight="fill" /> Montre-moi
            </button>
          </div>
        </div>

        {ligne.note && (
          <p className="mt-3 rounded-[16px] bg-petale-2 px-4 py-2.5 text-[16px] text-encre-lysa">
            {ligne.note}
          </p>
        )}

        {/* Les séries : pastilles qui éclosent au fur et à mesure */}
        <div className="mt-4 flex items-center justify-center gap-2.5">
          {series.map((s, i) => (
            <span
              key={i}
              className={`grid h-11 w-11 place-items-center rounded-full text-[17px] font-bold transition-colors duration-200 ${
                s.done
                  ? 'eclot bg-menthe text-white'
                  : i === iSerie
                    ? 'bg-rose text-white'
                    : 'bg-petale text-encre-lysa-2'
              }`}
            >
              {s.done ? <Check size={20} weight="bold" /> : i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* La saisie */}
      {serie && (
        <div className="mt-4 space-y-4">
          {unite === 'secondes' ? (
            <div className="carte-bonbon rounded-bonbon p-5 text-center">
              <p className="text-[17px] font-semibold text-encre-lysa">Tiens la position</p>
              <p className="font-rond mt-2 text-[52px] leading-none font-bold text-encre-lysa tabular-nums">
                {chronoDebut ? secondesTenues : serie.reps}
                <span className="ml-1.5 text-[20px] font-semibold text-encre-lysa-2">sec</span>
              </p>
              <div className="mt-4">
                {chronoDebut ? (
                  <BoutonDoux
                    onClick={() => {
                      majSerie({ reps: secondesTenues })
                      setChronoDebut(null)
                    }}
                  >
                    <Pause size={20} weight="fill" /> J'arrête
                  </BoutonDoux>
                ) : (
                  <BoutonDoux onClick={() => { setMaintenant(Date.now()); setChronoDebut(Date.now()) }}>
                    <Play size={20} weight="fill" /> Démarrer le chrono
                  </BoutonDoux>
                )}
              </div>
            </div>
          ) : (
            <Compteur
              label={
                unite === 'parJambe'
                  ? 'Répétitions par jambe'
                  : unite === 'parBras'
                    ? 'Répétitions par bras'
                    : unite === 'parCote'
                      ? 'Répétitions de chaque côté'
                      : 'Répétitions'
              }
              valeur={serie.reps}
              onChange={(n) => majSerie({ reps: n })}
              max={100}
              rappel={
                ligne.repsMin
                  ? `vise ${ligne.repsMax && ligne.repsMax !== ligne.repsMin ? `${ligne.repsMin} à ${ligne.repsMax}` : ligne.repsMin}`
                  : undefined
              }
            />
          )}

          {!sansPoids && (
            <Compteur
              label="Poids"
              valeur={serie.weight}
              onChange={(n) => majSerie({ weight: n })}
              pas={0.5}
              max={60}
              suffixe="kg"
            />
          )}
        </div>
      )}

      {/* Un seul geste valide la série */}
      <div className="mt-5 space-y-2.5">
        <BoutonRose onClick={validerSerie} disabled={chronoDebut !== null}>
          <Check size={24} weight="bold" /> Série terminée
        </BoutonRose>
        <div className="flex gap-2.5">
          <BoutonDoux onClick={() => setIndex((n) => Math.max(0, n - 1))} disabled={index === 0}>
            <ArrowLeft size={18} weight="bold" /> Précédent
          </BoutonDoux>
          <BoutonDoux
            onClick={() =>
              index >= jour.lignes.length - 1 ? setTerminee(true) : setIndex((n) => n + 1)
            }
          >
            {index >= jour.lignes.length - 1 ? (
              <>Finir <ArrowRight size={18} weight="bold" /></>
            ) : (
              <><SkipForward size={18} weight="fill" /> Passer</>
            )}
          </BoutonDoux>
        </div>
        <p className="pt-1 text-center text-[15px] text-encre-lysa-2 tabular-nums">
          {faites} séries sur {total} dans la séance
        </p>
      </div>

      {demo && <DemoExercice exercice={demo} ouverte onFermer={() => setDemo(null)} />}
    </div>
  )
}
