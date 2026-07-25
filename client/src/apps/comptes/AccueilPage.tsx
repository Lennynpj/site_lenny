import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUp, Plus } from '@phosphor-icons/react'
import { comptesApi } from '../../lib/comptes'
import type { Summary, Transaction } from '../../lib/comptes'
import { echeance, finDuMois, jourRelatif, memeMois, messageErreur, moisLong, montant } from './lib/mots'
import { Banniere, GrosBouton, LienAction, Liste, MessageErreur, Squelette, TitreSection } from './components/ui'
import FeuilleDepense from './components/FeuilleDepense'

export default function AccueilPage() {
  const [resume, setResume] = useState<Summary | null>(null)
  const [dernieres, setDernieres] = useState<Transaction[]>([])
  const [erreur, setErreur] = useState<string | null>(null)
  const [feuille, setFeuille] = useState<null | 'depense' | 'revenu'>(null)
  const [annulable, setAnnulable] = useState<
    { id?: string; libelle: string; montant: number; sens?: 'depense' | 'revenu' } | null
  >(null)
  const timer = useRef<number | null>(null)

  const charger = useCallback(() => {
    setErreur(null)
    Promise.all([comptesApi.summary(), comptesApi.transactions.list()])
      .then(([s, txs]) => {
        setResume(s)
        const mois = new Date()
        setDernieres(txs.filter((t) => memeMois(t.date, mois)).slice(0, 3))
      })
      .catch((e) => setErreur(messageErreur(e)))
  }, [])

  useEffect(() => charger(), [charger])
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  function ajoutee(info: { id?: string; libelle: string; montant: number; sens?: 'depense' | 'revenu' }) {
    charger()
    setAnnulable(info)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAnnulable(null), 8000)
  }

  async function annuler() {
    if (!annulable?.id) return
    try {
      await comptesApi.transactions.remove(annulable.id)
      setAnnulable(null)
      charger()
    } catch (e) {
      // Sans ça, l'annulation échouée passait inaperçue.
      setErreur(messageErreur(e, 'Annuler'))
    }
  }

  if (erreur && !resume) return <MessageErreur texte={erreur} onReessayer={charger} />
  if (!resume)
    return (
      <div className="space-y-4">
        <div className="skeleton h-64 rounded-carte" />
        <Squelette hauteur="h-16" nombre={1} />
      </div>
    )

  const { jour, restants } = finDuMois()
  const positif = resume.resteAVivre >= 0
  // L'épargne doit être comptée ici, sinon « Rentré − Parti » ne redonne pas
  // le montant affiché en grand.
  const parti = resume.subsMonthly + resume.variableThisMonth + resume.epargneThisMonth
  const total = resume.incomeMonthly || 1
  const partiPct = Math.min(100, Math.max(0, (parti / total) * 100))
  const vide = resume.incomeMonthly === 0 && parti === 0

  return (
    <div>
      {annulable && (
        <div className="mb-4">
          <Banniere ton="vert">
            <span className="flex-1 text-corps">
              <span className="font-semibold">
                {annulable.sens === 'revenu' ? 'Argent reçu enregistré' : 'Dépense enregistrée'}
              </span>{' '}
              — {annulable.libelle}, {montant(annulable.montant)}
            </span>
            <button
              onClick={annuler}
              className="shrink-0 text-corps font-semibold text-bleu-fonce underline underline-offset-2"
            >
              Annuler
            </button>
          </Banniere>
        </div>
      )}

      {/* Le chiffre — seule carte teintée de l'écran */}
      <section
        className="rise rounded-carte border border-trait-bleu bg-papier-bleu p-6"
        aria-live="polite"
        style={{ '--i': 0 } as React.CSSProperties}
      >
        {vide ? (
          <>
            <p className="text-corps text-encre-2">Pour commencer</p>
            <p className="mt-2 text-titre-section font-semibold text-encre">
              Dis-moi ce qui rentre chaque mois et ce que tu paies automatiquement.
            </p>
            <Link
              to="/comptes/mois"
              className="mt-5 flex h-16 w-full items-center justify-center gap-2 rounded-champ bg-bleu text-corps font-semibold text-papier"
            >
              Commencer <ArrowRight size={20} weight="bold" />
            </Link>
          </>
        ) : (
          <>
            <p className="text-corps text-encre-2">
              En {moisLong()}, {positif ? 'il te reste' : 'il te manque'}
            </p>
            <p
              className={`mt-1 text-chiffre-heros font-bold tracking-tight ${
                positif ? 'text-encre' : 'text-rouge'
              }`}
            >
              {montant(resume.resteAVivre)}
            </p>
            <p className="mt-1 text-secondaire text-encre-2">
              jusqu'au {jour} {moisLong()}, dans {restants} jours
            </p>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#e7eaee]">
              <div
                className="h-full rounded-full bg-bleu transition-[width] duration-200"
                style={{ width: `${partiPct}%` }}
              />
            </div>

            <dl className="mt-4 space-y-2">
              <div className="flex items-baseline gap-2">
                <ArrowDown size={18} weight="bold" className="shrink-0 translate-y-0.5 text-vert" />
                <dt className="flex-1 text-corps text-encre">Rentré ce mois-ci</dt>
                <dd className="text-montant font-semibold text-vert">{montant(resume.incomeMonthly)}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <ArrowUp size={18} weight="bold" className="shrink-0 translate-y-0.5 text-encre-2" />
                <dt className="flex-1 text-corps text-encre">Parti ou déjà prévu</dt>
                <dd className="text-montant font-semibold text-encre">{montant(parti)}</dd>
              </div>
              <p className="pl-6 text-secondaire text-encre-2">
                dont {montant(resume.subsMonthly)} de factures, {montant(resume.variableThisMonth)} de
                dépenses
                {resume.epargneThisMonth > 0 && <> et {montant(resume.epargneThisMonth)} mis de côté</>}
              </p>
            </dl>

            <p className="mt-4 text-secondaire text-encre-2">
              Tes factures du mois sont déjà retirées de ce montant.
            </p>
          </>
        )}
      </section>

      {/* Action principale — seul bouton coloré de l'écran */}
      <div className="mt-4">
        <GrosBouton onClick={() => setFeuille('depense')}>
          <Plus size={22} weight="bold" /> J'ai dépensé
        </GrosBouton>
        <LienAction onClick={() => setFeuille('revenu')}>J'ai reçu de l'argent</LienAction>
      </div>

      {/* Ce qui arrive bientôt */}
      {resume.nextDebits.length > 0 && (
        <section className="rise mt-7" style={{ '--i': 1 } as React.CSSProperties}>
          <TitreSection>Ce qui arrive bientôt</TitreSection>
          <Liste>
            {resume.nextDebits.slice(0, 3).map((d, i) => (
              <li key={i} className="flex min-h-16 items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-corps font-medium text-encre">{d.name}</p>
                  <p className="text-secondaire text-encre-2">{echeance(d.date, d.daysUntil)}</p>
                </div>
                <span className="text-montant font-semibold text-encre">{montant(d.amount)}</span>
              </li>
            ))}
          </Liste>
        </section>
      )}

      {/* Dernières dépenses */}
      {dernieres.length > 0 && (
        <section className="rise mt-7" style={{ '--i': 2 } as React.CSSProperties}>
          <TitreSection>Mes dernières dépenses</TitreSection>
          <Liste>
            {dernieres.map((t) => (
              <li key={t._id} className="flex min-h-16 items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-corps font-medium text-encre">{t.label}</p>
                  <p className="text-secondaire text-encre-2">{jourRelatif(t.date)}</p>
                </div>
                {/* Encre, pas rouge : une liste toute rouge culpabilise. */}
                <span className="text-montant font-semibold text-encre">
                  {t.kind === 'revenu' ? '+' : '−'} {montant(t.amount)}
                </span>
              </li>
            ))}
          </Liste>
          <Link
            to="/comptes/depenses"
            className="flex h-14 items-center justify-center gap-1.5 text-corps font-semibold text-bleu-fonce"
          >
            Voir toutes mes dépenses <ArrowRight size={18} weight="bold" />
          </Link>
        </section>
      )}

      <FeuilleDepense
        ouverte={feuille !== null}
        sens={feuille === 'revenu' ? 'revenu' : 'depense'}
        onFermer={() => setFeuille(null)}
        onAjoutee={ajoutee}
      />
    </div>
  )
}
