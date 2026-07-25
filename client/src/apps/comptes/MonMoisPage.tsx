import { useCallback, useEffect, useState } from 'react'
import { Check, Coins, PencilSimple, Plus, Receipt, TrashSimple } from '@phosphor-icons/react'
import { comptesApi } from '../../lib/comptes'
import type { Income, Subscription } from '../../lib/comptes'
import { jourDuMois, messageErreur, moisAnnee, montant } from './lib/mots'
import {
  BoutonSecondaire,
  Champ,
  Feuille,
  GrosBouton,
  Interrupteur,
  Liste,
  MessageErreur,
  RienPourLInstant,
  Squelette,
  Texte,
  TitreSection,
} from './components/ui'
import FeuilleConfirmation from './components/FeuilleConfirmation'
import ChampMontant from './components/ChampMontant'

const JOURS_COURTS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function MonMoisPage() {
  const [revenus, setRevenus] = useState<Income[] | null>(null)
  const [factures, setFactures] = useState<Subscription[] | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [editionFacture, setEditionFacture] = useState<Subscription | null>(null)
  const [editionRevenu, setEditionRevenu] = useState<Income | null>(null)
  const [aSupprimer, setASupprimer] = useState<
    { type: 'facture' | 'revenu'; id: string; rappel: string } | null
  >(null)
  const [jourChoisi, setJourChoisi] = useState<number | null>(null)

  const charger = useCallback(() => {
    setErreur(null)
    Promise.all([comptesApi.incomes.list(), comptesApi.subscriptions.list()])
      .then(([r, f]) => {
        setRevenus(r)
        setFactures(f)
      })
      .catch((e) => setErreur(messageErreur(e)))
  }, [])
  useEffect(() => charger(), [charger])

  async function supprimer() {
    if (!aSupprimer) return
    if (aSupprimer.type === 'facture') await comptesApi.subscriptions.remove(aSupprimer.id)
    else await comptesApi.incomes.remove(aSupprimer.id)
    setASupprimer(null)
    charger()
  }

  if (erreur && !revenus) return <MessageErreur texte={erreur} onReessayer={charger} />
  if (!revenus || !factures) return <Squelette hauteur="h-28" nombre={3} />

  // Calendrier du mois en cours
  const now = new Date()
  const premier = new Date(now.getFullYear(), now.getMonth(), 1)
  const nbJours = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const decalage = (premier.getDay() + 6) % 7 // lundi = 0
  const facturesActives = factures.filter((f) => f.active)
  const revenusActifs = revenus.filter((r) => r.active && r.type === 'recurrent')

  const dansLeJour = (j: number) => ({
    sorties: facturesActives.filter((f) => Math.min(f.dayOfMonth, nbJours) === j),
    entrees: revenusActifs.filter((r) => Math.min(r.dayOfMonth ?? 1, nbJours) === j),
  })

  const detail = jourChoisi ? dansLeJour(jourChoisi) : null

  return (
    <div>
      <h1 className="rise text-titre-page font-bold tracking-tight text-encre" style={{ '--i': 0 } as React.CSSProperties}>
        Mon mois
      </h1>
      <p className="mt-1 text-corps text-encre-2 capitalize">{moisAnnee()}</p>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      {/* Calendrier */}
      <section className="rise mt-5 rounded-carte border border-trait bg-papier p-4" style={{ '--i': 1 } as React.CSSProperties}>
        <div className="mb-2 grid grid-cols-7 gap-1">
          {JOURS_COURTS.map((j, i) => (
            <span key={i} className="text-center text-secondaire font-medium text-encre-2">
              {j}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: decalage }).map((_, i) => (
            <span key={`v${i}`} />
          ))}
          {Array.from({ length: nbJours }, (_, i) => i + 1).map((j) => {
            const { sorties, entrees } = dansLeJour(j)
            const aujourdhui = j === now.getDate()
            const actif = sorties.length > 0 || entrees.length > 0
            return (
              <button
                key={j}
                onClick={() => actif && setJourChoisi(jourChoisi === j ? null : j)}
                disabled={!actif}
                aria-label={`${j} ${moisAnnee()}${actif ? ', il se passe quelque chose' : ''}`}
                className={`flex h-12 flex-col items-center justify-center gap-1 rounded-lg text-corps transition-colors duration-100 ${
                  jourChoisi === j
                    ? 'bg-bleu text-papier'
                    : aujourdhui
                      ? 'border-2 border-bleu text-encre'
                      : actif
                        ? 'text-encre hover:bg-papier-2'
                        : 'text-encre-3'
                }`}
              >
                {j}
                <span className="flex h-1.5 gap-0.5">
                  {entrees.length > 0 && (
                    <span className={`h-1.5 w-1.5 rounded-full ${jourChoisi === j ? 'bg-papier' : 'bg-vert'}`} />
                  )}
                  {sorties.length > 0 && (
                    <span className={`h-1.5 w-1.5 rounded-full ${jourChoisi === j ? 'bg-papier' : 'bg-rouge'}`} />
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-trait pt-3">
          <span className="flex items-center gap-2 text-secondaire text-encre-2">
            <span className="h-2.5 w-2.5 rounded-full bg-vert" /> de l'argent rentre
          </span>
          <span className="flex items-center gap-2 text-secondaire text-encre-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rouge" /> une facture part
          </span>
        </div>

        {detail && (
          <div className="mt-3 rounded-champ bg-papier-2 p-4">
            <p className="text-corps font-semibold text-encre">
              Le {jourChoisi} {moisAnnee()}
            </p>
            <ul className="mt-2 space-y-1.5">
              {detail.entrees.map((r) => (
                <li key={r._id} className="flex justify-between gap-3 text-corps">
                  <span className="text-encre">{r.label}</span>
                  <span className="font-semibold text-vert">+ {montant(r.amount)}</span>
                </li>
              ))}
              {detail.sorties.map((f) => (
                <li key={f._id} className="flex justify-between gap-3 text-corps">
                  <span className="text-encre">{f.name}</span>
                  <span className="font-semibold text-encre">− {montant(f.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div>
      {/* Ce qui rentre */}
      <section className="rise mt-7 lg:mt-5" style={{ '--i': 2 } as React.CSSProperties}>
        <TitreSection>Ce qui rentre chaque mois</TitreSection>
        {revenus.length === 0 ? (
          <RienPourLInstant
            icone={<Coins size={26} />}
            titre="Rien pour l'instant"
            phrase="Ajoute ta retraite, ton salaire ou ce que tu reçois tous les mois."
            action={
              <BoutonSecondaire onClick={() => setEditionRevenu(nouveauRevenu())}>
                <Plus size={20} weight="bold" /> Ajouter ce qui rentre
              </BoutonSecondaire>
            }
          />
        ) : (
          <>
            <Liste>
              {revenus.map((r) => (
                <li key={r._id} className="flex min-h-16 items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-corps font-medium text-encre">{r.label}</p>
                    <p className="text-secondaire text-encre-2">
                      {r.type === 'recurrent' ? jourDuMois(r.dayOfMonth ?? 1) : 'reçu une fois'}
                      {!r.active && ' — en pause'}
                    </p>
                  </div>
                  <span className="text-montant font-semibold text-vert">+ {montant(r.amount)}</span>
                  <button
                    onClick={() => setEditionRevenu(r)}
                    aria-label={`Modifier ${r.label}`}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-encre-2 hover:bg-papier-2"
                  >
                    <PencilSimple size={20} />
                  </button>
                </li>
              ))}
            </Liste>
            <div className="mt-3">
              <BoutonSecondaire onClick={() => setEditionRevenu(nouveauRevenu())}>
                <Plus size={20} weight="bold" /> Ajouter ce qui rentre
              </BoutonSecondaire>
            </div>
          </>
        )}
      </section>

      {/* Ce qui part tout seul */}
      <section className="rise mt-7" style={{ '--i': 3 } as React.CSSProperties}>
        <TitreSection>Ce qui part tout seul</TitreSection>
        {factures.length === 0 ? (
          <RienPourLInstant
            icone={<Receipt size={26} />}
            titre="Rien pour l'instant"
            phrase="Ajoute ton loyer, l'électricité, le téléphone… avec le jour où c'est payé."
            action={
              <BoutonSecondaire onClick={() => setEditionFacture(nouvelleFacture())}>
                <Plus size={20} weight="bold" /> Ajouter une facture
              </BoutonSecondaire>
            }
          />
        ) : (
          <>
            <Liste>
              {[...factures]
                .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
                .map((f) => (
                  <li key={f._id} className="flex min-h-16 items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-corps font-medium text-encre">{f.name}</p>
                      <p className="text-secondaire text-encre-2">
                        {f.frequency === 'annuel'
                          ? `${montant(f.amount)} par an, soit ${montant(f.amount / 12)} par mois`
                          : jourDuMois(f.dayOfMonth)}
                        {!f.active && ' — en pause'}
                      </p>
                    </div>
                    <span className="text-montant font-semibold text-encre">{montant(f.amount)}</span>
                    <button
                      onClick={() => setEditionFacture(f)}
                      aria-label={`Modifier ${f.name}`}
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-encre-2 hover:bg-papier-2"
                    >
                      <PencilSimple size={20} />
                    </button>
                  </li>
                ))}
            </Liste>
            <div className="mt-3">
              <BoutonSecondaire onClick={() => setEditionFacture(nouvelleFacture())}>
                <Plus size={20} weight="bold" /> Ajouter une facture
              </BoutonSecondaire>
            </div>
          </>
        )}
      </section>

      </div>
      </div>

      {editionFacture && (
        <FormulaireFacture
          initial={editionFacture}
          onFermer={() => setEditionFacture(null)}
          onEnregistre={() => {
            setEditionFacture(null)
            charger()
          }}
          onSupprimer={(f) => {
            setEditionFacture(null)
            setASupprimer({ type: 'facture', id: f._id!, rappel: `${f.name}, ${montant(f.amount)}` })
          }}
        />
      )}

      {editionRevenu && (
        <FormulaireRevenu
          initial={editionRevenu}
          onFermer={() => setEditionRevenu(null)}
          onEnregistre={() => {
            setEditionRevenu(null)
            charger()
          }}
          onSupprimer={(r) => {
            setEditionRevenu(null)
            setASupprimer({ type: 'revenu', id: r._id!, rappel: `${r.label}, ${montant(r.amount)}` })
          }}
        />
      )}

      <FeuilleConfirmation
        ouverte={!!aSupprimer}
        titre={aSupprimer?.type === 'facture' ? 'Supprimer cette facture ?' : 'Supprimer ce revenu ?'}
        rappel={aSupprimer?.rappel ?? ''}
        phrase="Ce sera enlevé de tes comptes."
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={supprimer}
      />
    </div>
  )
}

const nouvelleFacture = (): Subscription => ({
  name: '',
  amount: 0,
  dayOfMonth: 1,
  frequency: 'mensuel',
  category: 'autre',
  active: true,
})

const nouveauRevenu = (): Income => ({
  label: '',
  amount: 0,
  type: 'recurrent',
  dayOfMonth: 1,
  frequency: 'mensuel',
  active: true,
})

function FormulaireFacture({
  initial,
  onFermer,
  onEnregistre,
  onSupprimer,
}: {
  initial: Subscription
  onFermer: () => void
  onEnregistre: () => void
  onSupprimer: (f: Subscription) => void
}) {
  const [f, setF] = useState<Subscription>(initial)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const set = (p: Partial<Subscription>) => setF((prev) => ({ ...prev, ...p }))

  async function enregistrer() {
    if (!f.name.trim() || f.amount <= 0) return
    setEnCours(true)
    setErreur(null)
    try {
      if (f._id) await comptesApi.subscriptions.update(f._id, f)
      else await comptesApi.subscriptions.create(f)
      onEnregistre()
    } catch (e) {
      setErreur(messageErreur(e, 'Enregistrer'))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Feuille ouverte onFermer={onFermer} titre={f._id ? 'Modifier la facture' : 'Ajouter une facture'}>
      <div className="space-y-5 pb-2">
        <Champ label="C'est quoi ?">
          <Texte value={f.name} placeholder="Ex. : Électricité" onChange={(e) => set({ name: e.target.value })} />
        </Champ>

        <ChampMontant label="Combien ?" valeur={f.amount} onChange={(n) => set({ amount: n })} />

        <Champ label="Le combien du mois ?" aide="Le jour où l'argent part de ton compte">
          <Texte
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            value={f.dayOfMonth}
            onChange={(e) => set({ dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })}
          />
        </Champ>

        <Champ label="À quelle fréquence ?">
          <div className="grid grid-cols-2 gap-2.5">
            {(['mensuel', 'annuel'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set({ frequency: v })}
                className={`h-14 rounded-champ border text-corps font-semibold transition-colors duration-100 ${
                  f.frequency === v
                    ? 'border-bleu bg-bleu-clair text-bleu-fonce'
                    : 'border-trait-champ bg-papier text-encre hover:bg-papier-2'
                }`}
              >
                {v === 'mensuel' ? 'Tous les mois' : 'Une fois par an'}
              </button>
            ))}
          </div>
        </Champ>

        <Interrupteur
          actif={f.active}
          onChange={(v) => set({ active: v })}
          motActif="Je paie encore ça"
          motInactif="En pause"
        />

        {erreur && <MessageErreur texte={erreur} />}

        <GrosBouton onClick={enregistrer} disabled={enCours || !f.name.trim() || f.amount <= 0}>
          <Check size={22} weight="bold" /> {enCours ? 'Un instant…' : 'Enregistrer'}
        </GrosBouton>

        {f._id && (
          <button
            onClick={() => onSupprimer(f)}
            className="flex h-14 w-full items-center justify-center gap-2 text-corps font-semibold text-rouge"
          >
            <TrashSimple size={20} /> Supprimer cette facture
          </button>
        )}
      </div>
    </Feuille>
  )
}

function FormulaireRevenu({
  initial,
  onFermer,
  onEnregistre,
  onSupprimer,
}: {
  initial: Income
  onFermer: () => void
  onEnregistre: () => void
  onSupprimer: (r: Income) => void
}) {
  const [r, setR] = useState<Income>(initial)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const set = (p: Partial<Income>) => setR((prev) => ({ ...prev, ...p }))

  async function enregistrer() {
    if (!r.label.trim() || r.amount <= 0) return
    setEnCours(true)
    setErreur(null)
    try {
      if (r._id) await comptesApi.incomes.update(r._id, r)
      else await comptesApi.incomes.create(r)
      onEnregistre()
    } catch (e) {
      setErreur(messageErreur(e, 'Enregistrer'))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Feuille ouverte onFermer={onFermer} titre={r._id ? 'Modifier' : 'Ajouter ce qui rentre'}>
      <div className="space-y-5 pb-2">
        <Champ label="C'est quoi ?">
          <Texte value={r.label} placeholder="Ex. : Retraite" onChange={(e) => set({ label: e.target.value })} />
        </Champ>

        <ChampMontant label="Combien ?" valeur={r.amount} onChange={(n) => set({ amount: n })} />

        <Champ label="Le combien du mois ?" aide="Le jour où l'argent arrive">
          <Texte
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            value={r.dayOfMonth ?? 1}
            onChange={(e) => set({ dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })}
          />
        </Champ>

        <Interrupteur
          actif={r.active}
          onChange={(v) => set({ active: v })}
          motActif="Je reçois encore ça"
          motInactif="En pause"
        />

        {erreur && <MessageErreur texte={erreur} />}

        <GrosBouton onClick={enregistrer} disabled={enCours || !r.label.trim() || r.amount <= 0}>
          <Check size={22} weight="bold" /> {enCours ? 'Un instant…' : 'Enregistrer'}
        </GrosBouton>

        {r._id && (
          <button
            onClick={() => onSupprimer(r)}
            className="flex h-14 w-full items-center justify-center gap-2 text-corps font-semibold text-rouge"
          >
            <TrashSimple size={20} /> Supprimer
          </button>
        )}
      </div>
    </Feuille>
  )
}
