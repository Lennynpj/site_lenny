import { useCallback, useEffect, useState } from 'react'
import { CaretLeft, CaretRight, Plus, Receipt, TrashSimple } from '@phosphor-icons/react'
import { comptesApi } from '../../lib/comptes'
import type { Summary, Transaction } from '../../lib/comptes'
import { cleMois, jourRelatif, memeMois, messageErreur, moisAnnee, montant } from './lib/mots'
import { GrosBouton, Liste, MessageErreur, RienPourLInstant, Squelette, TitreSection } from './components/ui'
import FeuilleConfirmation from './components/FeuilleConfirmation'
import FeuilleDepense from './components/FeuilleDepense'

/** Liste des dépenses + navigation mois par mois : sert d'historique ET de
 *  correction d'erreur (seul endroit où réparer une saisie). */
export default function MesDepensesPage() {
  const [mois, setMois] = useState(() => new Date())
  const [toutes, setToutes] = useState<Transaction[] | null>(null)
  const [resume, setResume] = useState<Summary | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [ajout, setAjout] = useState(false)
  const [aSupprimer, setASupprimer] = useState<Transaction | null>(null)

  const charger = useCallback(() => {
    setErreur(null)
    Promise.all([comptesApi.transactions.list(), comptesApi.summary(cleMois(mois))])
      .then(([txs, s]) => {
        setToutes(txs)
        setResume(s)
      })
      .catch((e) => setErreur(messageErreur(e)))
  }, [mois])
  useEffect(() => charger(), [charger])

  function decaler(pas: number) {
    setToutes(null)
    setMois((m) => new Date(m.getFullYear(), m.getMonth() + pas, 1))
  }

  async function supprimer() {
    if (!aSupprimer?._id) return
    await comptesApi.transactions.remove(aSupprimer._id)
    setASupprimer(null)
    charger()
  }

  const duMois = (toutes ?? []).filter((t) => memeMois(t.date, mois))
  const depenses = duMois.filter((t) => t.kind === 'depense')
  const totalDepenses = depenses.reduce((s, t) => s + t.amount, 0)
  const moisCourant = memeMois(new Date().toISOString(), mois)

  return (
    <div>
      <h1 className="rise text-titre-page font-bold tracking-tight text-encre" style={{ '--i': 0 } as React.CSSProperties}>
        Mes dépenses
      </h1>

      {/* Navigation par mois */}
      <div className="rise mt-4 flex items-center gap-2" style={{ '--i': 1 } as React.CSSProperties}>
        <button
          onClick={() => decaler(-1)}
          aria-label="Mois précédent"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-champ border border-trait-champ text-encre transition-colors duration-100 hover:bg-papier-2"
        >
          <CaretLeft size={22} weight="bold" />
        </button>
        <p className="flex-1 text-center text-titre-section font-semibold text-encre capitalize">
          {moisAnnee(mois)}
        </p>
        <button
          onClick={() => decaler(1)}
          disabled={moisCourant}
          aria-label="Mois suivant"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-champ border border-trait-champ text-encre transition-colors duration-100 hover:bg-papier-2 disabled:border-trait disabled:text-encre-3"
        >
          <CaretRight size={22} weight="bold" />
        </button>
      </div>

      {erreur && !toutes ? (
        <div className="mt-5">
          <MessageErreur texte={erreur} onReessayer={charger} />
        </div>
      ) : !toutes || !resume ? (
        <div className="mt-5">
          <Squelette hauteur="h-20" nombre={4} />
        </div>
      ) : (
        <>
          {/* Résumé du mois affiché */}
          <dl className="rise mt-5 grid grid-cols-3 gap-2.5" style={{ '--i': 2 } as React.CSSProperties}>
            {[
              { mot: 'Rentré', valeur: resume.incomeMonthly, ton: 'text-vert' },
              { mot: 'Dépensé', valeur: totalDepenses, ton: 'text-encre' },
              { mot: 'Factures', valeur: resume.subsMonthly, ton: 'text-encre' },
            ].map((c) => (
              <div key={c.mot} className="rounded-carte border border-trait bg-papier px-3 py-3.5 text-center">
                <dt className="text-secondaire text-encre-2">{c.mot}</dt>
                <dd className={`mt-0.5 text-montant font-semibold ${c.ton}`}>{montant(c.valeur)}</dd>
              </div>
            ))}
          </dl>

          {moisCourant && (
            <div className="mt-4">
              <GrosBouton onClick={() => setAjout(true)}>
                <Plus size={22} weight="bold" /> J'ai dépensé
              </GrosBouton>
            </div>
          )}

          <section className="rise mt-7" style={{ '--i': 3 } as React.CSSProperties}>
            <TitreSection>
              {duMois.length > 0 ? `Tout ce mois-ci` : 'Ce mois-ci'}
            </TitreSection>
            {duMois.length === 0 ? (
              <RienPourLInstant
                icone={<Receipt size={26} />}
                titre="Rien pour l'instant"
                phrase={
                  moisCourant
                    ? "Appuie sur « J'ai dépensé » quand tu achètes quelque chose."
                    : "Tu n'as rien noté ce mois-là."
                }
              />
            ) : (
              <Liste>
                {duMois.map((t) => (
                  <li key={t._id} className="flex min-h-16 items-center gap-2 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-corps font-medium text-encre">{t.label}</p>
                      <p className="text-secondaire text-encre-2">
                        {jourRelatif(t.date)}
                        {t.kind === 'epargne' && ' — mis de côté'}
                      </p>
                    </div>
                    <span
                      className={`text-montant font-semibold ${
                        t.kind === 'revenu' ? 'text-vert' : 'text-encre'
                      }`}
                    >
                      {t.kind === 'revenu' ? '+' : '−'} {montant(t.amount)}
                    </span>
                    <button
                      onClick={() => setASupprimer(t)}
                      aria-label={`Supprimer ${t.label}`}
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-encre-2 transition-colors duration-100 hover:bg-papier-2 hover:text-rouge"
                    >
                      <TrashSimple size={20} />
                    </button>
                  </li>
                ))}
              </Liste>
            )}
          </section>
        </>
      )}

      <FeuilleDepense ouverte={ajout} onFermer={() => setAjout(false)} onAjoutee={charger} />

      <FeuilleConfirmation
        ouverte={!!aSupprimer}
        titre="Supprimer cette dépense ?"
        rappel={
          aSupprimer
            ? `${aSupprimer.label}, ${montant(aSupprimer.amount)}, ${jourRelatif(aSupprimer.date)}`
            : ''
        }
        phrase="Elle sera enlevée de tes comptes."
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={supprimer}
      />
    </div>
  )
}
