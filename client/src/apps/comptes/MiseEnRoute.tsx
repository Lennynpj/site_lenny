import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  Plus,
  Receipt,
  ShoppingBag,
  TrashSimple,
  Wallet,
} from '@phosphor-icons/react'
import { comptesApi } from '../../lib/comptes'
import type { ExpenseTemplate, Income, Subscription } from '../../lib/comptes'
import { jourCourt, messageErreur, montant } from './lib/mots'
import {
  BoutonSecondaire,
  Champ,
  GrosBouton,
  Liste,
  MessageErreur,
  Texte,
} from './components/ui'
import ChampMontant from './components/ChampMontant'
import ChampJour from './components/ChampJour'

/* Mise en route guidée, à faire UNE fois, idéalement à deux.
   Deux partis pris :
   — l'assistant prend tout l'écran (ni en-tête ni barre d'onglets), sinon on
     peut en sortir par mégarde au milieu d'une question ;
   — chaque ligne est enregistrée dès qu'on l'ajoute, donc s'arrêter en chemin
     ou fermer l'app ne perd rien. */

export const CLE_ETAT = 'comptes_mise_en_route'
export const CLE_FORCER = 'comptes_mise_en_route_forcer'

/* Où elle en est. « faite » = terminée ou reportée volontairement ; un nombre =
   elle s'est arrêtée à cette question. Sans ça, ajouter un seul revenu suffisait
   à faire disparaître l'assistant (le profil n'était plus « vide ») et les deux
   questions suivantes ne revenaient jamais. */
export function etatMiseEnRoute(): 'faite' | number | null {
  const brut = localStorage.getItem(CLE_ETAT)
  if (brut === 'faite') return 'faite'
  const n = brut?.startsWith('etape:') ? Number(brut.slice(6)) : NaN
  return Number.isInteger(n) && n >= 0 && n <= 2 ? n : null
}

const ETAPES = [
  { titre: 'Ce qui rentre', question: 'Qu’est-ce qui rentre chaque\u00a0mois\u00a0?' },
  { titre: 'Ce qui part tout seul', question: 'Qu’est-ce qui part tout\u00a0seul\u00a0?' },
  { titre: 'Mes boutons', question: 'Sur quoi dépenses-tu le plus\u00a0souvent\u00a0?' },
] as const

/** Signature du brouillon en cours de saisie dans l'étape affichée. */
type Brouillon = { pret: boolean; valider: () => Promise<void> } | null

export default function MiseEnRoute({
  prenom,
  onTermine,
}: {
  prenom: string
  onTermine: () => void
}) {
  // -1 = écran d'ouverture, 0..2 = étapes, 3 = fin
  const [etape, setEtape] = useState(() => {
    // Relancée depuis Réglages : on repart du début, pas au milieu.
    if (localStorage.getItem(CLE_FORCER) === '1') return -1
    const etat = etatMiseEnRoute()
    return typeof etat === 'number' ? etat : -1
  })
  // Vrai seulement si on l'a retrouvée en cours de route (message de reprise).
  const [reprise, setReprise] = useState(() => typeof etatMiseEnRoute() === 'number')
  const [revenus, setRevenus] = useState<Income[]>([])
  const [factures, setFactures] = useState<Subscription[]>([])
  const [modeles, setModeles] = useState<ExpenseTemplate[]>([])
  const [erreur, setErreur] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  // Remonté par l'étape affichée : une ligne remplie mais pas encore ajoutée.
  const [brouillonPret, setBrouillonPret] = useState(false)
  const brouillon = useRef<Brouillon>(null)
  const minuteur = useRef<number | null>(null)

  const charger = useCallback(() => {
    Promise.all([comptesApi.incomes.list(), comptesApi.subscriptions.list(), comptesApi.templates.list()])
      .then(([r, f, m]) => {
        setRevenus(r)
        setFactures(f)
        setModeles(m)
      })
      .catch((e) => setErreur(messageErreur(e)))
  }, [])
  useEffect(() => charger(), [charger])

  // L'assistant occupe tout l'écran : on empêche la page du dessous de défiler.
  useEffect(() => {
    const avant = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = avant
    }
  }, [])

  useEffect(() => () => { if (minuteur.current) window.clearTimeout(minuteur.current) }, [])

  /** Accusé de réception : sans ça, on ne sait pas si l'appui a marché. */
  const annoncer = useCallback((phrase: string) => {
    setConfirmation(phrase)
    if (minuteur.current) window.clearTimeout(minuteur.current)
    minuteur.current = window.setTimeout(() => setConfirmation(null), 4000)
  }, [])

  // On note l'avancement à chaque question : si elle ferme l'app, on la
  // ramènera exactement ici.
  useEffect(() => {
    if (etape >= 0 && etape <= 2) localStorage.setItem(CLE_ETAT, `etape:${etape}`)
    if (etape === 3) localStorage.setItem(CLE_ETAT, 'faite')
  }, [etape])

  function terminer() {
    localStorage.removeItem(CLE_FORCER)
    localStorage.setItem(CLE_ETAT, 'faite')
    onTermine()
  }

  /* Une ligne remplie mais pas « ajoutée » serait perdue en passant à la suite :
     on l'enregistre avant d'avancer plutôt que de la laisser filer. */
  async function avancer() {
    if (brouillon.current?.pret) await brouillon.current.valider()
    setConfirmation(null)
    setReprise(false)
    setEtape((e) => e + 1)
  }

  function reculer() {
    setConfirmation(null)
    setReprise(false)
    setEtape((e) => e - 1)
  }

  const totalRentre = revenus.reduce((s, r) => s + (r.frequency === 'annuel' ? r.amount / 12 : r.amount), 0)
  const totalPart = factures.reduce((s, f) => s + (f.frequency === 'annuel' ? f.amount / 12 : f.amount), 0)
  const nombres = [revenus.length, factures.length, modeles.length]

  // ── Écran d'ouverture ────────────────────────────────────────────
  if (etape === -1) {
    return (
      <Ecran
        pied={
          <>
            <GrosBouton onClick={() => setEtape(0)}>
              C&apos;est parti <ArrowRight size={20} weight="bold" />
            </GrosBouton>
            <button
              onClick={terminer}
              className="mt-1 flex h-14 w-full items-center justify-center text-corps font-medium text-encre-2"
            >
              Je le ferai plus tard
            </button>
          </>
        }
      >
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <span className="rise grid h-16 w-16 place-items-center rounded-carte bg-bleu-clair text-bleu">
              <Wallet size={30} weight="fill" />
            </span>
            <h1
              className="rise mt-5 text-titre-page font-bold tracking-tight text-encre"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              Bonjour {prenom}
            </h1>
            <p
              className="rise mt-3 max-w-[38ch] text-corps text-encre-2"
              style={{ '--i': 2 } as React.CSSProperties}
            >
              On va remplir tes comptes ensemble. Il y a trois questions, ça prend cinq minutes.
            </p>
            <p
              className="rise mt-3 max-w-[38ch] text-corps text-encre-2"
              style={{ '--i': 3 } as React.CSSProperties}
            >
              Tu pourras tout changer plus tard, et si tu t&apos;arrêtes en route, rien ne sera perdu.
            </p>
          </div>

          {/* Les trois questions annoncées : on sait où on met les pieds */}
          <ol className="mt-8 lg:mt-0">
            {ETAPES.map((e, i) => (
              <li
                key={e.titre}
                className="rise relative flex gap-4 pb-6 last:pb-0"
                style={{ '--i': 3 + i } as React.CSSProperties}
              >
                {i < ETAPES.length - 1 && (
                  <span aria-hidden className="absolute top-11 bottom-0 left-[19px] w-px bg-trait" />
                )}
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-trait bg-papier text-corps font-semibold text-encre-2">
                  {i + 1}
                </span>
                <span className="pt-2 text-corps font-medium text-encre">{e.titre}</span>
              </li>
            ))}
          </ol>
        </div>
      </Ecran>
    )
  }

  // ── Écran de fin ─────────────────────────────────────────────────
  if (etape === 3) {
    const reste = totalRentre - totalPart
    return (
      <Ecran pied={<GrosBouton onClick={terminer}>Voir mes comptes</GrosBouton>}>
        <span className="rise grid h-16 w-16 place-items-center rounded-carte bg-vert-clair text-vert">
          <Check size={30} weight="bold" />
        </span>
        <h1
          className="rise mt-5 text-titre-page font-bold tracking-tight text-encre"
          style={{ '--i': 1 } as React.CSSProperties}
        >
          C&apos;est prêt
        </h1>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-10">
          <div
            className="rise mt-5 rounded-carte border border-trait-bleu bg-papier-bleu p-6"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            <p className="text-corps text-encre-2">Chaque mois, il devrait te rester à peu près</p>
            <p
              className={`mt-1 text-chiffre-heros font-bold tracking-tight ${
                reste >= 0 ? 'text-encre' : 'text-rouge'
              }`}
            >
              {montant(reste)}
            </p>
            <p className="mt-2 text-secondaire text-encre-2">
              {montant(totalRentre)} qui rentrent, moins {montant(totalPart)} de factures. Tes dépenses
              de tous les jours viendront se retirer de ce montant.
            </p>
          </div>

          <div className="mt-5 lg:mt-5">
            {/* Récapitulatif : elle voit ce qu'elle vient d'enregistrer */}
            <ul
              className="rise divide-y divide-trait rounded-carte border border-trait"
              style={{ '--i': 3 } as React.CSSProperties}
            >
              {[
                { mot: 'ce qui rentre', n: nombres[0], icone: <Coins size={20} weight="fill" className="text-vert" /> },
                { mot: 'factures', n: nombres[1], icone: <Receipt size={20} weight="fill" className="text-encre-2" /> },
                { mot: 'boutons de dépense', n: nombres[2], icone: <ShoppingBag size={20} weight="fill" className="text-encre-2" /> },
              ].map((l) => (
                <li key={l.mot} className="flex min-h-14 items-center gap-3 px-4 py-2.5">
                  <span className="shrink-0">{l.icone}</span>
                  <span className="flex-1 text-corps text-encre-2">{l.mot}</span>
                  <span className="font-mono text-montant font-semibold text-encre">{l.n}</span>
                </li>
              ))}
            </ul>

            <p
              className="rise mt-5 text-corps text-encre-2"
              style={{ '--i': 4 } as React.CSSProperties}
            >
              Maintenant, quand tu achètes quelque chose, appuie sur{' '}
              <span className="font-semibold text-encre">« J&apos;ai dépensé »</span> et choisis un de
              tes boutons.
            </p>
          </div>
        </div>
      </Ecran>
    )
  }

  // ── Étapes de saisie ─────────────────────────────────────────────
  const vide = nombres[etape] === 0

  return (
    <Ecran
      progression={(etape + 1) / 3}
      enTete={
        <span className="text-secondaire text-encre-2">
          Étape {etape + 1} sur 3
          <span className="hidden sm:inline"> — {ETAPES[etape].titre}</span>
        </span>
      }
      onPlusTard={terminer}
      pied={
        <>
          {/* Le bouton dit ce qu'il va faire. Tant qu'il n'y a rien à valider,
              il reste discret : sinon un gros bouton bleu invite à sauter la
              question alors que « Ajouter » est plus bas dans l'écran. */}
          {brouillonPret ? (
            <GrosBouton onClick={avancer}>
              Ajouter et continuer <ArrowRight size={20} weight="bold" />
            </GrosBouton>
          ) : vide ? (
            <BoutonSecondaire onClick={avancer}>
              Passer cette question <ArrowRight size={20} weight="bold" />
            </BoutonSecondaire>
          ) : (
            <GrosBouton onClick={avancer}>
              {etape === 2 ? 'Terminer' : 'Suivant'} <ArrowRight size={20} weight="bold" />
            </GrosBouton>
          )}
          <button
            onClick={reculer}
            className="mt-1 flex h-14 w-full items-center justify-center gap-1.5 text-corps font-medium text-encre-2"
          >
            <ArrowLeft size={18} /> Revenir en arrière
          </button>
        </>
      }
    >
      {/* Sur PC : la question reste à gauche pendant qu'on remplit à droite */}
      <div className="lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-6 lg:self-start">
          {reprise && (
            <p className="rise mb-3 text-corps text-encre-2">
              On reprend là où tu t&apos;étais arrêtée.
            </p>
          )}
          <h1 key={etape} className="rise text-titre-page font-bold tracking-tight text-encre">
            {ETAPES[etape].question}
          </h1>
          <p
            key={`p${etape}`}
            className="rise mt-3 max-w-[42ch] text-corps text-encre-2"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            {etape === 0 && 'Ta retraite, ton salaire, une pension, une aide… Ajoute-les un par un.'}
            {etape === 1 &&
              'Le loyer, l’électricité, le téléphone, la mutuelle… Tout ce qui est prélevé automatiquement.'}
            {etape === 2 &&
              'Ce seront tes raccourcis : un seul appui et la dépense est notée. Indique le montant habituel, tu pourras le changer sur le moment.'}
          </p>

          {/* Ce que ça donne pour l'instant — le total prend sens au fil de la saisie */}
          {(etape === 0 ? totalRentre : etape === 1 ? totalPart : modeles.length) > 0 && (
            <p className="mt-4 border-l-2 border-trait-bleu pl-3 text-corps text-encre-2">
              {etape === 0 && (
                <>
                  Pour l&apos;instant,{' '}
                  <span className="font-semibold text-encre">{montant(totalRentre)}</span> rentrent
                  chaque mois.
                </>
              )}
              {etape === 1 && (
                <>
                  <span className="font-semibold text-encre">{montant(totalPart)}</span> partent tout
                  seuls, il resterait{' '}
                  <span className="font-semibold text-encre">{montant(totalRentre - totalPart)}</span>.
                </>
              )}
              {etape === 2 && (
                <>
                  <span className="font-semibold text-encre">{modeles.length}</span>{' '}
                  {modeles.length > 1 ? 'boutons prêts' : 'bouton prêt'}.
                </>
              )}
            </p>
          )}
        </div>

        <div className="mt-6 lg:mt-0">
          {erreur && (
            <div className="mb-4">
              <MessageErreur texte={erreur} onReessayer={charger} />
            </div>
          )}

          {confirmation && (
            <p
              role="status"
              className="rise mb-4 flex items-center gap-2.5 rounded-carte border border-vert-trait bg-vert-clair px-4 py-3 text-corps text-encre"
            >
              <Check size={20} weight="bold" className="shrink-0 text-vert" />
              {confirmation}
            </p>
          )}

          {etape === 0 && (
            <EtapeRevenus
              revenus={revenus}
              brouillon={brouillon}
              onBrouillon={setBrouillonPret}
              onChange={charger}
              onErreur={setErreur}
              onAjoute={annoncer}
            />
          )}
          {etape === 1 && (
            <EtapeFactures
              factures={factures}
              brouillon={brouillon}
              onBrouillon={setBrouillonPret}
              onChange={charger}
              onErreur={setErreur}
              onAjoute={annoncer}
            />
          )}
          {etape === 2 && (
            <EtapeModeles
              modeles={modeles}
              brouillon={brouillon}
              onBrouillon={setBrouillonPret}
              onChange={charger}
              onErreur={setErreur}
              onAjoute={annoncer}
            />
          )}
        </div>
      </div>
    </Ecran>
  )
}

/* ── Coquille commune ───────────────────────────────────────────────
   Plein écran, au-dessus du dock : pendant la mise en route, rien d'autre
   ne doit pouvoir capter un appui. */
function Ecran({
  progression,
  enTete,
  onPlusTard,
  pied,
  children,
}: {
  progression?: number
  enTete?: ReactNode
  onPlusTard?: () => void
  pied: ReactNode
  children: ReactNode
}) {
  return (
    <section
      aria-label="Mise en route"
      className="fixed inset-0 z-30 flex flex-col bg-papier"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {(enTete || progression !== undefined) && (
        <header className="shrink-0 border-b border-trait">
          <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-5 py-3.5 lg:max-w-5xl lg:px-8">
            <p className="min-w-0 flex-1 truncate">{enTete}</p>
            {onPlusTard && (
              <button
                onClick={onPlusTard}
                className="-mr-2 shrink-0 rounded-champ px-2 py-2 text-secondaire font-semibold text-bleu-fonce transition-colors duration-100 hover:bg-papier-2"
              >
                Plus tard
              </button>
            )}
          </div>
          {progression !== undefined && (
            <div className="h-1 w-full bg-papier-2">
              <div
                className="h-full bg-bleu transition-[width] duration-300 ease-out"
                style={{ width: `${progression * 100}%` }}
              />
            </div>
          )}
        </header>
      )}

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-xl px-5 py-7 lg:max-w-5xl lg:px-8 lg:py-10">{children}</div>
      </div>

      <footer className="shrink-0 border-t border-trait bg-papier px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:px-8">
        <div className="mx-auto w-full max-w-xl lg:max-w-md">{pied}</div>
      </footer>
    </section>
  )
}

/** Suggestions à taper en un appui : la saisie au clavier reste l'exception. */
function Suggestions({
  mots,
  deja,
  onChoisir,
}: {
  mots: readonly string[]
  deja: string[]
  onChoisir: (mot: string) => void
}) {
  const normalise = (s: string) => s.trim().toLowerCase()
  const restants = mots.filter((m) => !deja.some((d) => normalise(d) === normalise(m)))
  if (restants.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-secondaire text-encre-2">Appuie sur un mot pour le remplir</p>
      <div className="flex flex-wrap gap-2">
        {restants.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChoisir(m)}
            className="h-12 rounded-champ border border-trait-champ bg-papier px-3.5 text-corps text-encre transition-[background-color,transform] duration-100 hover:bg-papier-2 active:scale-[0.97]"
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Ligne enregistrée, avec le bouton pour la retirer. */
function LigneAjoutee({
  icone,
  nom,
  detail,
  somme,
  couleurSomme = 'text-encre',
  onRetirer,
}: {
  icone: ReactNode
  nom: string
  detail?: string
  somme: string
  couleurSomme?: string
  onRetirer: () => void
}) {
  return (
    <li className="rise flex min-h-16 items-center gap-3 px-4 py-3">
      <span className="shrink-0">{icone}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-corps font-medium text-encre">{nom}</p>
        {detail && (
          <p className="truncate text-secondaire text-encre-2 first-letter:uppercase">{detail}</p>
        )}
      </div>
      <span className={`shrink-0 text-montant font-semibold ${couleurSomme}`}>{somme}</span>
      <button
        onClick={onRetirer}
        aria-label={`Retirer ${nom}`}
        className="-mr-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-encre-2 transition-colors duration-100 hover:bg-papier-2 hover:text-rouge"
      >
        <TrashSimple size={20} />
      </button>
    </li>
  )
}

/** Bloc de saisie commun aux deux premières questions (nom, montant, jour). */
function Ajout({
  labelNom,
  exemple,
  labelJour,
  suggestions,
  deja,
  brouillon,
  onBrouillon,
  onAjouter,
}: {
  labelNom: string
  exemple: string
  labelJour: string
  suggestions: readonly string[]
  deja: string[]
  brouillon: React.RefObject<Brouillon>
  onBrouillon: (pret: boolean) => void
  onAjouter: (nom: string, somme: number, jour: number) => Promise<void>
}) {
  const [nom, setNom] = useState('')
  const [somme, setSomme] = useState(0)
  const [jour, setJour] = useState(1)
  const [enCours, setEnCours] = useState(false)
  const pret = nom.trim().length > 0 && somme > 0

  const valider = useCallback(async () => {
    if (!pret || enCours) return
    setEnCours(true)
    try {
      await onAjouter(nom.trim(), somme, jour)
      setNom('')
      setSomme(0)
      setJour(1)
    } finally {
      setEnCours(false)
    }
  }, [pret, enCours, onAjouter, nom, somme, jour])

  /* On expose le brouillon au parent : appuyer sur « Suivant » avec une ligne
     remplie mais pas ajoutée l'enregistre au lieu de la jeter. */
  useEffect(() => {
    brouillon.current = { pret, valider }
    onBrouillon(pret)
    return () => {
      brouillon.current = null
      onBrouillon(false)
    }
  }, [brouillon, onBrouillon, pret, valider])

  return (
    <div className="mt-4 space-y-5 rounded-carte border border-dashed border-trait-champ p-4">
      <Suggestions mots={suggestions} deja={deja} onChoisir={setNom} />

      <Champ label={labelNom}>
        <Texte value={nom} placeholder={exemple} onChange={(e) => setNom(e.target.value)} />
      </Champ>
      <ChampMontant label="Combien ?" valeur={somme} onChange={setSomme} />
      <ChampJour label={labelJour} valeur={jour} onChange={setJour} />

      <BoutonSecondaire onClick={valider} disabled={enCours || !pret}>
        <Plus size={20} weight="bold" /> {enCours ? 'Un instant…' : 'Ajouter à ma liste'}
      </BoutonSecondaire>
    </div>
  )
}

const REVENUS_COURANTS = ['Retraite', 'Salaire', 'Pension', 'Aide au logement'] as const

function EtapeRevenus({
  revenus,
  brouillon,
  onBrouillon,
  onChange,
  onErreur,
  onAjoute,
}: {
  revenus: Income[]
  brouillon: React.RefObject<Brouillon>
  onBrouillon: (pret: boolean) => void
  onChange: () => void
  onErreur: (m: string) => void
  onAjoute: (phrase: string) => void
}) {
  return (
    <div>
      {revenus.length > 0 && (
        <Liste>
          {revenus.map((r) => (
            <LigneAjoutee
              key={r._id}
              icone={<Coins size={22} weight="fill" className="text-vert" />}
              nom={r.label}
              detail={jourCourt(r.dayOfMonth ?? 1)}
              somme={`+ ${montant(r.amount)}`}
              couleurSomme="text-vert"
              onRetirer={async () => {
                if (r._id) await comptesApi.incomes.remove(r._id)
                onChange()
              }}
            />
          ))}
        </Liste>
      )}

      <Ajout
        labelNom="C'est quoi ?"
        exemple="Ex. : Retraite"
        labelJour="Ça arrive quel jour du mois ?"
        suggestions={REVENUS_COURANTS}
        deja={revenus.map((r) => r.label)}
        brouillon={brouillon}
        onBrouillon={onBrouillon}
        onAjouter={async (nom, somme, jour) => {
          try {
            await comptesApi.incomes.create({
              label: nom,
              amount: somme,
              type: 'recurrent',
              dayOfMonth: jour,
              frequency: 'mensuel',
              active: true,
            })
            onChange()
            onAjoute(`${nom}, ${montant(somme)} — c'est noté.`)
          } catch (e) {
            onErreur(messageErreur(e, 'Ajouter'))
          }
        }}
      />
    </div>
  )
}

const FACTURES_COURANTES = [
  'Loyer',
  'Électricité',
  'Téléphone',
  'Internet',
  'Mutuelle',
  'Assurance',
  'Eau',
] as const

function EtapeFactures({
  factures,
  brouillon,
  onBrouillon,
  onChange,
  onErreur,
  onAjoute,
}: {
  factures: Subscription[]
  brouillon: React.RefObject<Brouillon>
  onBrouillon: (pret: boolean) => void
  onChange: () => void
  onErreur: (m: string) => void
  onAjoute: (phrase: string) => void
}) {
  return (
    <div>
      {factures.length > 0 && (
        <Liste>
          {[...factures]
            .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
            .map((f) => (
              <LigneAjoutee
                key={f._id}
                icone={<Receipt size={22} weight="fill" className="text-encre-2" />}
                nom={f.name}
                detail={jourCourt(f.dayOfMonth)}
                somme={montant(f.amount)}
                onRetirer={async () => {
                  if (f._id) await comptesApi.subscriptions.remove(f._id)
                  onChange()
                }}
              />
            ))}
        </Liste>
      )}

      <Ajout
        labelNom="C'est quoi ?"
        exemple="Ex. : Électricité"
        labelJour="C'est prélevé quel jour du mois ?"
        suggestions={FACTURES_COURANTES}
        deja={factures.map((f) => f.name)}
        brouillon={brouillon}
        onBrouillon={onBrouillon}
        onAjouter={async (nom, somme, jour) => {
          try {
            await comptesApi.subscriptions.create({
              name: nom,
              amount: somme,
              dayOfMonth: jour,
              frequency: 'mensuel',
              category: 'autre',
              active: true,
            })
            onChange()
            onAjoute(`${nom}, ${montant(somme)} — c'est noté.`)
          } catch (e) {
            onErreur(messageErreur(e, 'Ajouter'))
          }
        }}
      />
    </div>
  )
}

const DEPENSES_COURANTES = [
  'Courses',
  'Pharmacie',
  'Essence',
  'Coiffeur',
  'Restaurant',
  'Cadeaux',
] as const

function EtapeModeles({
  modeles,
  brouillon,
  onBrouillon,
  onChange,
  onErreur,
  onAjoute,
}: {
  modeles: ExpenseTemplate[]
  brouillon: React.RefObject<Brouillon>
  onBrouillon: (pret: boolean) => void
  onChange: () => void
  onErreur: (m: string) => void
  onAjoute: (phrase: string) => void
}) {
  const [nom, setNom] = useState('')
  const [somme, setSomme] = useState(0)
  const [enCours, setEnCours] = useState(false)
  const pret = nom.trim().length > 0

  const valider = useCallback(async () => {
    if (!pret || enCours) return
    setEnCours(true)
    try {
      await comptesApi.templates.create({ label: nom.trim(), defaultAmount: somme, category: 'autre' })
      onChange()
      onAjoute(`Bouton « ${nom.trim()} » créé.`)
      setNom('')
      setSomme(0)
    } catch (e) {
      onErreur(messageErreur(e, 'Ajouter'))
    } finally {
      setEnCours(false)
    }
  }, [pret, enCours, nom, somme, onChange, onErreur, onAjoute])

  useEffect(() => {
    brouillon.current = { pret, valider }
    onBrouillon(pret)
    return () => {
      brouillon.current = null
      onBrouillon(false)
    }
  }, [brouillon, onBrouillon, pret, valider])

  return (
    <div>
      {modeles.length > 0 && (
        <Liste>
          {modeles.map((m) => (
            <LigneAjoutee
              key={m._id}
              icone={
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ backgroundColor: m.color || '#8a929c' }}
                />
              }
              nom={m.label}
              somme={montant(m.defaultAmount)}
              onRetirer={async () => {
                if (m._id) await comptesApi.templates.remove(m._id)
                onChange()
              }}
            />
          ))}
        </Liste>
      )}

      <div className="mt-4 space-y-5 rounded-carte border border-dashed border-trait-champ p-4">
        <Suggestions
          mots={DEPENSES_COURANTES}
          deja={modeles.map((m) => m.label)}
          onChoisir={setNom}
        />

        <Champ label="C'est quoi ?">
          <Texte value={nom} placeholder="Ex. : Pharmacie" onChange={(e) => setNom(e.target.value)} />
        </Champ>
        <ChampMontant
          label="Montant habituel"
          aide="Tu pourras toujours le changer au moment de noter"
          valeur={somme}
          onChange={setSomme}
        />

        <BoutonSecondaire onClick={valider} disabled={enCours || !pret}>
          <Plus size={20} weight="bold" /> {enCours ? 'Un instant…' : 'Ajouter ce bouton'}
        </BoutonSecondaire>
      </div>
    </div>
  )
}
