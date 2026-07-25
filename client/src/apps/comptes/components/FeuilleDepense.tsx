import { useEffect, useState } from 'react'
import { ArrowLeft, Check } from '@phosphor-icons/react'
import { comptesApi } from '../../../lib/comptes'
import type { ExpenseTemplate } from '../../../lib/comptes'
import { jourRelatif, messageErreur } from '../lib/mots'
import { Champ, Feuille, GrosBouton, LienAction, MessageErreur, Texte } from './ui'
import PaveNumerique, { afficheSaisie, versNombre } from './PaveNumerique'

/* Parcours en 3 taps : « J'ai dépensé » → tuile « Courses 50 € » → « C'est noté ».
   Étape 1 = choisir (jamais un clavier vide), étape 2 = ajuster le montant. */

type Etape = 'choix' | 'montant'

export default function FeuilleDepense({
  ouverte,
  onFermer,
  onAjoutee,
  sens = 'depense',
}: {
  ouverte: boolean
  onFermer: () => void
  onAjoutee: (info: { id?: string; libelle: string; montant: number }) => void
  sens?: 'depense' | 'revenu'
}) {
  const [modeles, setModeles] = useState<ExpenseTemplate[]>([])
  const [etape, setEtape] = useState<Etape>('choix')
  const [libelle, setLibelle] = useState('')
  const [categorie, setCategorie] = useState('autre')
  const [saisie, setSaisie] = useState('')
  const [preRempli, setPreRempli] = useState(true)
  const [quand, setQuand] = useState<Date>(new Date())
  const [choisirDate, setChoisirDate] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    if (!ouverte) return
    setEtape('choix')
    setLibelle('')
    setSaisie('')
    setPreRempli(true)
    setQuand(new Date())
    setChoisirDate(false)
    setErreur(null)
    if (sens === 'depense') comptesApi.templates.list().then(setModeles).catch(() => setModeles([]))
  }, [ouverte, sens])

  function choisirModele(m: ExpenseTemplate) {
    setLibelle(m.label)
    setCategorie(m.category || 'autre')
    setSaisie(m.defaultAmount ? String(m.defaultAmount).replace('.', ',') : '')
    setPreRempli(!!m.defaultAmount)
    setEtape('montant')
  }

  function choisirAutre() {
    setLibelle('')
    setCategorie('autre')
    setSaisie('')
    setPreRempli(false)
    setEtape('montant')
  }

  async function enregistrer() {
    const valeur = versNombre(saisie)
    if (!libelle.trim() || valeur <= 0) return
    setEnCours(true)
    setErreur(null)
    try {
      const tx = await comptesApi.transactions.create({
        label: libelle.trim(),
        amount: valeur,
        kind: sens,
        category: categorie,
        date: quand.toISOString(),
      })
      onAjoutee({ id: tx._id, libelle: libelle.trim(), montant: valeur })
      onFermer()
    } catch (e) {
      setErreur(messageErreur(e, "C'est noté"))
    } finally {
      setEnCours(false)
    }
  }

  const titre =
    sens === 'revenu' ? "J'ai reçu de l'argent" : etape === 'choix' ? "J'ai dépensé" : libelle || 'Ma dépense'

  return (
    <Feuille
      ouverte={ouverte}
      onFermer={onFermer}
      titre={titre}
      pleinEcran
      enTete={
        etape === 'montant' && sens === 'depense' ? (
          <button
            onClick={() => setEtape('choix')}
            className="mt-1 flex items-center gap-1.5 text-secondaire font-medium text-bleu-fonce"
          >
            <ArrowLeft size={16} weight="bold" /> Choisir autre chose
          </button>
        ) : null
      }
    >
      {etape === 'choix' ? (
        <div className="pb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {modeles.map((m) => (
              <button
                key={m._id}
                onClick={() => choisirModele(m)}
                className="flex h-[88px] flex-col items-start justify-center gap-1 rounded-champ border border-trait-champ bg-papier px-4 text-left transition-colors duration-100 hover:bg-papier-2 active:bg-bleu-clair"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: m.color || '#8a929c' }}
                  />
                  <span className="text-montant font-semibold text-encre">{m.label}</span>
                </span>
                {m.defaultAmount > 0 && (
                  <span className="text-corps text-encre-2">{m.defaultAmount} €</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={choisirAutre}
            className="mt-2.5 flex h-16 w-full items-center justify-center rounded-champ border border-trait-champ bg-papier text-corps font-semibold text-encre transition-colors duration-100 hover:bg-papier-2"
          >
            {sens === 'revenu' ? 'Indiquer le montant' : 'Autre chose'}
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col pb-2">
          {/* Montant en cours de saisie */}
          <div className="text-center">
            <span
              className={`inline-block rounded-champ px-4 py-1.5 text-chiffre-saisie font-bold tracking-tight text-encre ${
                preRempli ? 'bg-bleu-clair' : ''
              }`}
            >
              {afficheSaisie(saisie)}
            </span>
            <p className="mt-1.5 text-secondaire text-encre-2">
              {preRempli ? 'Appuie sur les chiffres pour changer' : 'Appuie sur les chiffres'}
            </p>
          </div>

          {/* Libellé si « Autre chose » */}
          {!libelle && (
            <div className="mt-4">
              <Champ label="C'était quoi ?">
                <Texte
                  value={libelle}
                  placeholder="Ex. : Coiffeur"
                  autoFocus
                  onChange={(e) => setLibelle(e.target.value)}
                />
              </Champ>
            </div>
          )}

          <div className="mt-4">
            <PaveNumerique
              valeur={saisie}
              preRempli={preRempli}
              onChange={(v) => {
                setSaisie(v)
                setPreRempli(false)
              }}
              onValider={enregistrer}
            />
          </div>

          {/* Date */}
          {choisirDate ? (
            <div className="mt-4 space-y-2.5">
              {[
                { mot: "Aujourd'hui", d: new Date() },
                { mot: 'Hier', d: new Date(Date.now() - 86_400_000) },
              ].map(({ mot, d }) => (
                <button
                  key={mot}
                  onClick={() => {
                    setQuand(d)
                    setChoisirDate(false)
                  }}
                  className="h-14 w-full rounded-champ border border-trait-champ bg-papier text-corps font-semibold text-encre transition-colors duration-100 hover:bg-papier-2"
                >
                  {mot}
                </button>
              ))}
              <Champ label="Ou choisis une date">
                <Texte
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    if (!e.target.value) return
                    setQuand(new Date(e.target.value))
                    setChoisirDate(false)
                  }}
                />
              </Champ>
            </div>
          ) : (
            <LienAction onClick={() => setChoisirDate(true)}>
              {jourRelatif(quand.toISOString()) === "aujourd'hui"
                ? "C'était un autre jour"
                : `C'était ${jourRelatif(quand.toISOString())} — changer`}
            </LienAction>
          )}

          {erreur && (
            <div className="mt-3">
              <MessageErreur texte={erreur} />
            </div>
          )}

          <div className="mt-auto pt-4">
            {versNombre(saisie) <= 0 && (
              <p className="mb-2 text-center text-secondaire text-encre-2">
                Indique d'abord un montant.
              </p>
            )}
            {!libelle.trim() && versNombre(saisie) > 0 && (
              <p className="mb-2 text-center text-secondaire text-encre-2">
                Écris ce que c'était.
              </p>
            )}
            <GrosBouton
              onClick={enregistrer}
              disabled={enCours || versNombre(saisie) <= 0 || !libelle.trim()}
            >
              <Check size={22} weight="bold" /> {enCours ? 'Un instant…' : "C'est noté"}
            </GrosBouton>
            <LienAction onClick={onFermer}>Annuler</LienAction>
          </div>
        </div>
      )}
    </Feuille>
  )
}
