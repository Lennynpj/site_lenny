import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Coins, Plus, Receipt, TrashSimple, Wallet } from '@phosphor-icons/react'
import { comptesApi } from '../../lib/comptes'
import type { ExpenseTemplate, Income, Subscription } from '../../lib/comptes'
import { jourDuMois, messageErreur, montant } from './lib/mots'
import {
  BoutonSecondaire,
  Champ,
  GrosBouton,
  LienAction,
  Liste,
  MessageErreur,
  Texte,
  TitreSection,
} from './components/ui'
import ChampMontant from './components/ChampMontant'

/* Mise en route guidée, à faire UNE fois, idéalement à deux.
   Chaque ligne est enregistrée dès qu'on l'ajoute : si elle s'arrête en
   chemin ou ferme l'app, rien n'est perdu et elle reprend où elle en était. */

export const CLE_IGNOREE = 'comptes_mise_en_route_ignoree'
export const CLE_FORCER = 'comptes_mise_en_route_forcer'

const ETAPES = ['Ce qui rentre', 'Ce qui part tout seul', 'Mes boutons'] as const

export default function MiseEnRoute({
  prenom,
  onTermine,
}: {
  prenom: string
  onTermine: () => void
}) {
  // -1 = écran d'accueil de l'assistant, 0..2 = étapes, 3 = fin
  const [etape, setEtape] = useState(-1)
  const [revenus, setRevenus] = useState<Income[]>([])
  const [factures, setFactures] = useState<Subscription[]>([])
  const [modeles, setModeles] = useState<ExpenseTemplate[]>([])
  const [erreur, setErreur] = useState<string | null>(null)

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

  function terminer() {
    localStorage.removeItem(CLE_FORCER)
    localStorage.setItem(CLE_IGNOREE, '1')
    onTermine()
  }

  const totalRentre = revenus.reduce((s, r) => s + (r.frequency === 'annuel' ? r.amount / 12 : r.amount), 0)
  const totalPart = factures.reduce((s, f) => s + (f.frequency === 'annuel' ? f.amount / 12 : f.amount), 0)

  // ── Écran d'ouverture ────────────────────────────────────────────
  if (etape === -1) {
    return (
      <div className="page-entre">
        <span className="grid h-14 w-14 place-items-center rounded-carte bg-bleu-clair text-bleu">
          <Wallet size={28} weight="fill" />
        </span>
        <h1 className="mt-4 text-titre-page font-bold tracking-tight text-encre">Bonjour {prenom}</h1>
        <p className="mt-3 text-corps text-encre-2">
          On va remplir tes comptes ensemble. Il y a trois questions, ça prend cinq minutes.
        </p>
        <p className="mt-3 text-corps text-encre-2">
          Tu pourras tout changer plus tard, et si tu t'arrêtes en route, rien ne sera perdu.
        </p>

        <ol className="mt-6 space-y-3">
          {ETAPES.map((mot, i) => (
            <li key={mot} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-papier-2 text-corps font-semibold text-encre-2">
                {i + 1}
              </span>
              <span className="text-corps text-encre">{mot}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <GrosBouton onClick={() => setEtape(0)}>
            C'est parti <ArrowRight size={20} weight="bold" />
          </GrosBouton>
          <LienAction onClick={terminer}>Je le ferai plus tard</LienAction>
        </div>
      </div>
    )
  }

  // ── Écran de fin ─────────────────────────────────────────────────
  if (etape === 3) {
    const reste = totalRentre - totalPart
    return (
      <div className="page-entre">
        <span className="grid h-14 w-14 place-items-center rounded-carte bg-vert-clair text-vert">
          <Check size={28} weight="bold" />
        </span>
        <h1 className="mt-4 text-titre-page font-bold tracking-tight text-encre">C'est prêt</h1>

        <div className="mt-5 rounded-carte border border-trait-bleu bg-papier-bleu p-6">
          <p className="text-corps text-encre-2">Chaque mois, il devrait te rester à peu près</p>
          <p className={`mt-1 text-chiffre-heros font-bold tracking-tight ${reste >= 0 ? 'text-encre' : 'text-rouge'}`}>
            {montant(reste)}
          </p>
          <p className="mt-2 text-secondaire text-encre-2">
            {montant(totalRentre)} qui rentrent, moins {montant(totalPart)} de factures. Tes dépenses de
            tous les jours viendront se retirer de ce montant.
          </p>
        </div>

        <p className="mt-5 text-corps text-encre-2">
          Maintenant, quand tu achètes quelque chose, appuie sur{' '}
          <span className="font-semibold text-encre">« J'ai dépensé »</span> et choisis un de tes boutons.
        </p>

        <div className="mt-8">
          <GrosBouton onClick={terminer}>Voir mes comptes</GrosBouton>
        </div>
      </div>
    )
  }

  // ── Étapes de saisie ─────────────────────────────────────────────
  return (
    <div className="page-entre">
      {/* Progression : elle voit toujours où elle en est et que ça se termine */}
      <p className="font-mono text-secondaire text-encre-2">Étape {etape + 1} sur 3</p>
      <div className="mt-2 flex gap-1.5">
        {ETAPES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= etape ? 'bg-bleu' : 'bg-[#e7eaee]'}`}
          />
        ))}
      </div>

      {erreur && (
        <div className="mt-4">
          <MessageErreur texte={erreur} onReessayer={charger} />
        </div>
      )}

      {etape === 0 && (
        <EtapeRevenus revenus={revenus} onChange={charger} onErreur={setErreur} />
      )}
      {etape === 1 && (
        <EtapeFactures factures={factures} onChange={charger} onErreur={setErreur} />
      )}
      {etape === 2 && (
        <EtapeModeles modeles={modeles} onChange={charger} onErreur={setErreur} />
      )}

      <div className="mt-8">
        <GrosBouton onClick={() => setEtape(etape + 1)}>
          {etape === 2 ? 'Terminer' : 'Suivant'} <ArrowRight size={20} weight="bold" />
        </GrosBouton>
        <button
          onClick={() => setEtape(etape - 1)}
          className="flex h-14 w-full items-center justify-center gap-1.5 text-corps font-medium text-encre-2"
        >
          <ArrowLeft size={18} /> Revenir en arrière
        </button>
      </div>
    </div>
  )
}

/** Bloc « ajouter une ligne » commun aux deux premières étapes. */
function Ajout({
  labelNom,
  exemple,
  labelJour,
  onAjouter,
}: {
  labelNom: string
  exemple: string
  labelJour: string
  onAjouter: (nom: string, somme: number, jour: number) => Promise<void>
}) {
  const [nom, setNom] = useState('')
  const [somme, setSomme] = useState(0)
  const [jour, setJour] = useState(1)
  const [enCours, setEnCours] = useState(false)

  async function valider() {
    if (!nom.trim() || somme <= 0 || enCours) return
    setEnCours(true)
    try {
      await onAjouter(nom.trim(), somme, jour)
      setNom('')
      setSomme(0)
      setJour(1)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="mt-4 space-y-4 rounded-carte border border-dashed border-trait-champ p-4">
      <Champ label={labelNom}>
        <Texte value={nom} placeholder={exemple} onChange={(e) => setNom(e.target.value)} />
      </Champ>
      <ChampMontant label="Combien ?" valeur={somme} onChange={setSomme} />
      <Champ label={labelJour} aide="Si tu ne sais pas exactement, mets une date approchante">
        <Texte
          type="number"
          inputMode="numeric"
          min={1}
          max={31}
          value={jour}
          onChange={(e) => setJour(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
        />
      </Champ>
      <BoutonSecondaire onClick={valider} disabled={enCours || !nom.trim() || somme <= 0}>
        <Plus size={20} weight="bold" /> {enCours ? 'Un instant…' : 'Ajouter'}
      </BoutonSecondaire>
    </div>
  )
}

function EtapeRevenus({
  revenus,
  onChange,
  onErreur,
}: {
  revenus: Income[]
  onChange: () => void
  onErreur: (m: string) => void
}) {
  return (
    <div className="mt-5">
      <TitreSection>Qu'est-ce qui rentre chaque mois ?</TitreSection>
      <p className="mb-4 text-corps text-encre-2">
        Ta retraite, ton salaire, une pension, une aide… Ajoute-les un par un.
      </p>

      {revenus.length > 0 && (
        <Liste>
          {revenus.map((r) => (
            <li key={r._id} className="flex min-h-16 items-center gap-3 px-5 py-3">
              <Coins size={22} weight="fill" className="shrink-0 text-vert" />
              <div className="min-w-0 flex-1">
                <p className="text-corps font-medium text-encre">{r.label}</p>
                <p className="text-secondaire text-encre-2">{jourDuMois(r.dayOfMonth ?? 1)}</p>
              </div>
              <span className="text-montant font-semibold text-vert">+ {montant(r.amount)}</span>
              <button
                onClick={async () => {
                  if (r._id) await comptesApi.incomes.remove(r._id)
                  onChange()
                }}
                aria-label={`Retirer ${r.label}`}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-encre-2 hover:text-rouge"
              >
                <TrashSimple size={20} />
              </button>
            </li>
          ))}
        </Liste>
      )}

      <Ajout
        labelNom="C'est quoi ?"
        exemple="Ex. : Retraite"
        labelJour="Le combien du mois ça arrive ?"
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
          } catch (e) {
            onErreur(messageErreur(e, 'Ajouter'))
          }
        }}
      />
    </div>
  )
}

function EtapeFactures({
  factures,
  onChange,
  onErreur,
}: {
  factures: Subscription[]
  onChange: () => void
  onErreur: (m: string) => void
}) {
  return (
    <div className="mt-5">
      <TitreSection>Qu'est-ce qui part tout seul ?</TitreSection>
      <p className="mb-4 text-corps text-encre-2">
        Le loyer, l'électricité, le téléphone, la mutuelle… Tout ce qui est prélevé automatiquement.
      </p>

      {factures.length > 0 && (
        <Liste>
          {[...factures]
            .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
            .map((f) => (
              <li key={f._id} className="flex min-h-16 items-center gap-3 px-5 py-3">
                <Receipt size={22} weight="fill" className="shrink-0 text-encre-2" />
                <div className="min-w-0 flex-1">
                  <p className="text-corps font-medium text-encre">{f.name}</p>
                  <p className="text-secondaire text-encre-2">{jourDuMois(f.dayOfMonth)}</p>
                </div>
                <span className="text-montant font-semibold text-encre">{montant(f.amount)}</span>
                <button
                  onClick={async () => {
                    if (f._id) await comptesApi.subscriptions.remove(f._id)
                    onChange()
                  }}
                  aria-label={`Retirer ${f.name}`}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-encre-2 hover:text-rouge"
                >
                  <TrashSimple size={20} />
                </button>
              </li>
            ))}
        </Liste>
      )}

      <Ajout
        labelNom="C'est quoi ?"
        exemple="Ex. : Électricité"
        labelJour="Le combien du mois c'est prélevé ?"
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
          } catch (e) {
            onErreur(messageErreur(e, 'Ajouter'))
          }
        }}
      />
    </div>
  )
}

function EtapeModeles({
  modeles,
  onChange,
  onErreur,
}: {
  modeles: ExpenseTemplate[]
  onChange: () => void
  onErreur: (m: string) => void
}) {
  const [nom, setNom] = useState('')
  const [somme, setSomme] = useState(0)
  const [enCours, setEnCours] = useState(false)

  async function ajouter() {
    if (!nom.trim() || enCours) return
    setEnCours(true)
    try {
      await comptesApi.templates.create({ label: nom.trim(), defaultAmount: somme, category: 'autre' })
      setNom('')
      setSomme(0)
      onChange()
    } catch (e) {
      onErreur(messageErreur(e, 'Ajouter'))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="mt-5">
      <TitreSection>Sur quoi dépenses-tu le plus souvent ?</TitreSection>
      <p className="mb-4 text-corps text-encre-2">
        Ce seront tes raccourcis : un seul appui et la dépense est notée. Indique le montant que tu
        dépenses d'habitude — tu pourras toujours le changer sur le moment.
      </p>

      {modeles.length > 0 && (
        <Liste>
          {modeles.map((m) => (
            <li key={m._id} className="flex min-h-16 items-center gap-3 px-5 py-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: m.color || '#8a929c' }}
              />
              <p className="min-w-0 flex-1 text-corps font-medium text-encre">{m.label}</p>
              <span className="text-corps text-encre-2">{montant(m.defaultAmount)}</span>
              <button
                onClick={async () => {
                  if (m._id) await comptesApi.templates.remove(m._id)
                  onChange()
                }}
                aria-label={`Retirer ${m.label}`}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-encre-2 hover:text-rouge"
              >
                <TrashSimple size={20} />
              </button>
            </li>
          ))}
        </Liste>
      )}

      <div className="mt-4 space-y-4 rounded-carte border border-dashed border-trait-champ p-4">
        <Champ label="C'est quoi ?">
          <Texte value={nom} placeholder="Ex. : Pharmacie" onChange={(e) => setNom(e.target.value)} />
        </Champ>
        <ChampMontant label="Montant habituel" valeur={somme} onChange={setSomme} />
        <BoutonSecondaire onClick={ajouter} disabled={enCours || !nom.trim()}>
          <Plus size={20} weight="bold" /> {enCours ? 'Un instant…' : 'Ajouter ce bouton'}
        </BoutonSecondaire>
      </div>
    </div>
  )
}
