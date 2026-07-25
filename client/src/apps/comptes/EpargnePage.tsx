import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, Check, PencilSimple, PiggyBank, Plus, TrashSimple } from '@phosphor-icons/react'
import { comptesApi } from '../../lib/comptes'
import type { Asset, Transaction } from '../../lib/comptes'
import { jourRelatif, messageErreur, montant } from './lib/mots'
import {
  BoutonSecondaire,
  Champ,
  Feuille,
  GrosBouton,
  Liste,
  MessageErreur,
  RienPourLInstant,
  Squelette,
  Texte,
  TitreSection,
} from './components/ui'
import FeuilleConfirmation from './components/FeuilleConfirmation'
import PaveNumerique, { afficheSaisie, versNombre } from './components/PaveNumerique'

/* Épargne volontairement simple : un nom, un montant. Pas de type de placement,
   pas de taux de rendement, pas de versement automatique. */

export default function EpargnePage() {
  const [enveloppes, setEnveloppes] = useState<Asset[] | null>(null)
  const [mouvements, setMouvements] = useState<Transaction[]>([])
  const [erreur, setErreur] = useState<string | null>(null)
  const [mettreDeCote, setMettreDeCote] = useState(false)
  const [edition, setEdition] = useState<Asset | null>(null)
  const [aSupprimer, setASupprimer] = useState<Asset | null>(null)

  const charger = useCallback(() => {
    setErreur(null)
    Promise.all([comptesApi.assets.list(), comptesApi.transactions.list()])
      .then(([a, txs]) => {
        setEnveloppes(a)
        setMouvements(txs.filter((t) => t.kind === 'epargne').slice(0, 5))
      })
      .catch((e) => setErreur(messageErreur(e)))
  }, [])
  useEffect(() => charger(), [charger])

  async function supprimer() {
    if (!aSupprimer?._id) return
    await comptesApi.assets.remove(aSupprimer._id)
    setASupprimer(null)
    charger()
  }

  if (erreur && !enveloppes) return <MessageErreur texte={erreur} onReessayer={charger} />
  if (!enveloppes) return <Squelette hauteur="h-24" nombre={3} />

  // Le compte courant n'est pas de l'épargne : on ne compte que les enveloppes.
  const epargnes = enveloppes.filter((a) => a.type !== 'courant')
  const courant = enveloppes.find((a) => a.type === 'courant')
  const total = epargnes.reduce((s, a) => s + (a.balance || 0), 0)

  return (
    <div>
      <h1 className="rise text-titre-page font-bold tracking-tight text-encre" style={{ '--i': 0 } as React.CSSProperties}>
        Mon épargne
      </h1>

      <section
        className="rise mt-4 rounded-carte border border-trait-bleu bg-papier-bleu p-6"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        <p className="text-corps text-encre-2">J'ai mis de côté</p>
        <p className="mt-1 text-chiffre-heros font-bold tracking-tight text-encre">{montant(total)}</p>
        {courant && (
          <p className="mt-1 text-secondaire text-encre-2">
            Il y a {montant(courant.balance)} sur ton compte courant.
          </p>
        )}
      </section>

      {epargnes.length > 0 && (
        <div className="mt-4">
          <GrosBouton onClick={() => setMettreDeCote(true)}>
            <ArrowDown size={22} weight="bold" /> Mettre de côté
          </GrosBouton>
        </div>
      )}

      <section className="rise mt-7" style={{ '--i': 2 } as React.CSSProperties}>
        <TitreSection>Où j'ai mis mon argent</TitreSection>
        {epargnes.length === 0 ? (
          <RienPourLInstant
            icone={<PiggyBank size={26} />}
            titre="Rien pour l'instant"
            phrase="Crée une réserve, par exemple « Livret A » ou « Pour les vacances »."
            action={
              <BoutonSecondaire onClick={() => setEdition(nouvelle())}>
                <Plus size={20} weight="bold" /> Créer une réserve
              </BoutonSecondaire>
            }
          />
        ) : (
          <>
            <Liste>
              {epargnes.map((a) => (
                <li key={a._id} className="flex min-h-16 items-center gap-3 px-5 py-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bleu-clair text-bleu">
                    <PiggyBank size={22} weight="fill" />
                  </span>
                  <p className="min-w-0 flex-1 text-corps font-medium text-encre">{a.name}</p>
                  <span className="text-montant font-semibold text-encre">{montant(a.balance)}</span>
                  <button
                    onClick={() => setEdition(a)}
                    aria-label={`Modifier ${a.name}`}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-encre-2 hover:bg-papier-2"
                  >
                    <PencilSimple size={20} />
                  </button>
                </li>
              ))}
            </Liste>
            <div className="mt-3">
              <BoutonSecondaire onClick={() => setEdition(nouvelle())}>
                <Plus size={20} weight="bold" /> Créer une réserve
              </BoutonSecondaire>
            </div>
          </>
        )}
      </section>

      {mouvements.length > 0 && (
        <section className="rise mt-7" style={{ '--i': 3 } as React.CSSProperties}>
          <TitreSection>Ce que j'ai mis de côté récemment</TitreSection>
          <Liste>
            {mouvements.map((m) => (
              <li key={m._id} className="flex min-h-16 items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-corps font-medium text-encre">{m.label}</p>
                  <p className="text-secondaire text-encre-2">{jourRelatif(m.date)}</p>
                </div>
                <span className="text-montant font-semibold text-bleu-fonce">{montant(m.amount)}</span>
              </li>
            ))}
          </Liste>
        </section>
      )}

      {mettreDeCote && (
        <FeuilleMiseDeCote
          enveloppes={epargnes}
          onFermer={() => setMettreDeCote(false)}
          onFait={() => {
            setMettreDeCote(false)
            charger()
          }}
        />
      )}

      {edition && (
        <FormulaireEnveloppe
          initial={edition}
          onFermer={() => setEdition(null)}
          onEnregistre={() => {
            setEdition(null)
            charger()
          }}
          onSupprimer={(a) => {
            setEdition(null)
            setASupprimer(a)
          }}
        />
      )}

      <FeuilleConfirmation
        ouverte={!!aSupprimer}
        titre="Supprimer cette réserve ?"
        rappel={aSupprimer ? `${aSupprimer.name}, ${montant(aSupprimer.balance)}` : ''}
        phrase="L'argent ne sera pas perdu : seule la ligne disparaît de tes comptes."
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={supprimer}
      />
    </div>
  )
}

const nouvelle = (): Asset => ({ name: '', type: 'livret', balance: 0 })

function FeuilleMiseDeCote({
  enveloppes,
  onFermer,
  onFait,
}: {
  enveloppes: Asset[]
  onFermer: () => void
  onFait: () => void
}) {
  const [cible, setCible] = useState(enveloppes[0]?._id ?? '')
  const [saisie, setSaisie] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function valider() {
    const valeur = versNombre(saisie)
    if (!cible || valeur <= 0) return
    setEnCours(true)
    setErreur(null)
    try {
      await comptesApi.setAside(cible, valeur)
      onFait()
    } catch (e) {
      setErreur(messageErreur(e, 'Mettre de côté'))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Feuille ouverte onFermer={onFermer} titre="Mettre de côté" pleinEcran>
      <div className="flex flex-1 flex-col pb-2">
        <p className="text-corps text-encre-2">
          Cet argent part de ton compte courant pour aller dans ta réserve.
        </p>

        {enveloppes.length > 1 && (
          <div className="mt-4 space-y-2.5">
            <p className="text-corps font-medium text-encre">Dans quelle réserve ?</p>
            {enveloppes.map((a) => (
              <button
                key={a._id}
                onClick={() => setCible(a._id!)}
                className={`flex h-14 w-full items-center justify-between rounded-champ border px-4 text-corps transition-colors duration-100 ${
                  cible === a._id
                    ? 'border-bleu bg-bleu-clair font-semibold text-bleu-fonce'
                    : 'border-trait-champ bg-papier text-encre hover:bg-papier-2'
                }`}
              >
                {a.name}
                {cible === a._id && <Check size={20} weight="bold" />}
              </button>
            ))}
          </div>
        )}

        <p className="mt-5 text-center text-chiffre-saisie font-bold tracking-tight text-encre">
          {afficheSaisie(saisie)}
        </p>

        <div className="mt-4">
          <PaveNumerique valeur={saisie} preRempli={false} onChange={setSaisie} onValider={valider} />
        </div>

        {erreur && (
          <div className="mt-3">
            <MessageErreur texte={erreur} />
          </div>
        )}

        <div className="mt-auto pt-4">
          <GrosBouton onClick={valider} disabled={enCours || versNombre(saisie) <= 0 || !cible}>
            <ArrowDown size={22} weight="bold" /> {enCours ? 'Un instant…' : 'Mettre de côté'}
          </GrosBouton>
        </div>
      </div>
    </Feuille>
  )
}

function FormulaireEnveloppe({
  initial,
  onFermer,
  onEnregistre,
  onSupprimer,
}: {
  initial: Asset
  onFermer: () => void
  onEnregistre: () => void
  onSupprimer: (a: Asset) => void
}) {
  const [a, setA] = useState<Asset>(initial)
  const [saisie, setSaisie] = useState(a.balance ? String(a.balance).replace('.', ',') : '')
  const [ouvrirMontant, setOuvrirMontant] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function enregistrer() {
    if (!a.name.trim()) return
    setEnCours(true)
    setErreur(null)
    const corps = { ...a, balance: versNombre(saisie) }
    try {
      if (a._id) await comptesApi.assets.update(a._id, corps)
      else await comptesApi.assets.create(corps)
      onEnregistre()
    } catch (e) {
      setErreur(messageErreur(e, 'Enregistrer'))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Feuille ouverte onFermer={onFermer} titre={a._id ? 'Modifier la réserve' : 'Créer une réserve'}>
      <div className="space-y-5 pb-2">
        <Champ label="Comment tu l'appelles ?">
          <Texte
            value={a.name}
            placeholder="Ex. : Livret A"
            onChange={(e) => setA((p) => ({ ...p, name: e.target.value }))}
          />
        </Champ>

        <Champ label="Combien il y a dedans ?">
          <button
            type="button"
            onClick={() => setOuvrirMontant(true)}
            className="flex h-14 w-full items-center justify-between rounded-champ border border-trait-champ bg-papier px-4 text-corps text-encre transition-colors duration-100 hover:bg-papier-2"
          >
            <span className={saisie ? 'font-semibold' : 'text-encre-3'}>
              {saisie ? `${saisie} €` : 'Appuie pour indiquer'}
            </span>
            <span className="text-secondaire text-bleu-fonce">Modifier</span>
          </button>
        </Champ>

        {erreur && <MessageErreur texte={erreur} />}

        <GrosBouton onClick={enregistrer} disabled={enCours || !a.name.trim()}>
          <Check size={22} weight="bold" /> {enCours ? 'Un instant…' : 'Enregistrer'}
        </GrosBouton>

        {a._id && (
          <button
            onClick={() => onSupprimer(a)}
            className="flex h-14 w-full items-center justify-center gap-2 text-corps font-semibold text-rouge"
          >
            <TrashSimple size={20} /> Supprimer cette réserve
          </button>
        )}
      </div>

      <Feuille ouverte={ouvrirMontant} onFermer={() => setOuvrirMontant(false)} titre="Combien ?">
        <div className="pb-2">
          <p className="mb-4 text-center text-chiffre-saisie font-bold tracking-tight text-encre">
            {afficheSaisie(saisie)}
          </p>
          <PaveNumerique
            valeur={saisie}
            preRempli={false}
            onChange={setSaisie}
            onValider={() => setOuvrirMontant(false)}
          />
          <div className="mt-4">
            <GrosBouton onClick={() => setOuvrirMontant(false)}>
              <Check size={22} weight="bold" /> C'est bon
            </GrosBouton>
          </div>
        </div>
      </Feuille>
    </Feuille>
  )
}
