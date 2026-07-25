import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Check, Plus, ScanSmiley, SignOut, TextAa, TrashSimple } from '@phosphor-icons/react'
import { authApi, comptesApi } from '../../lib/comptes'
import type { ExpenseTemplate, ProfilePublic } from '../../lib/comptes'
import { messageErreur } from './lib/mots'
import {
  Banniere,
  BoutonSecondaire,
  Carte,
  Champ,
  Feuille,
  GrosBouton,
  Liste,
  MessageErreur,
  Squelette,
  Texte,
  TitreSection,
} from './components/ui'
import FeuilleConfirmation from './components/FeuilleConfirmation'
import ChampMontant from './components/ChampMontant'

type Contexte = { profil: ProfilePublic; onQuitter: () => void }

const CLE_TAILLE = 'comptes_texte_grand'

export default function ReglagesPage() {
  const { profil, onQuitter } = useOutletContext<Contexte>()
  const [modeles, setModeles] = useState<ExpenseTemplate[] | null>(null)
  const [edition, setEdition] = useState<ExpenseTemplate | null>(null)
  const [aSupprimer, setASupprimer] = useState<ExpenseTemplate | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [faceId, setFaceId] = useState(profil.hasFaceId)
  const [messageFaceId, setMessageFaceId] = useState<string | null>(null)
  const [texteGrand, setTexteGrand] = useState(() => localStorage.getItem(CLE_TAILLE) === '1')

  // Déjà ouverte depuis l'écran d'accueil ? Alors on ne propose plus de l'ajouter.
  const estInstallee =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  const surIphone = /iPhone|iPad|iPod/.test(navigator.userAgent)

  const charger = useCallback(() => {
    comptesApi.templates
      .list()
      .then(setModeles)
      .catch((e) => setErreur(messageErreur(e)))
  }, [])
  useEffect(() => charger(), [charger])

  // Taille du texte : on n'annule PAS en quittant la page, sinon le réglage
  // ne durait que le temps d'être sur Réglages. ComptesLayout le réapplique
  // à chaque ouverture de l'app.
  useEffect(() => {
    document.documentElement.style.fontSize = texteGrand ? '21px' : ''
    localStorage.setItem(CLE_TAILLE, texteGrand ? '1' : '0')
  }, [texteGrand])

  async function activerFaceId() {
    setMessageFaceId(null)
    try {
      await authApi.registerFaceId()
      setFaceId(true)
      setMessageFaceId('Face ID activé sur cet appareil.')
    } catch (e) {
      setMessageFaceId(messageErreur(e, 'Activer Face ID'))
    }
  }

  async function supprimer() {
    if (!aSupprimer?._id) return
    await comptesApi.templates.remove(aSupprimer._id)
    setASupprimer(null)
    charger()
  }

  return (
    <div>
      <h1 className="rise text-titre-page font-bold tracking-tight text-encre" style={{ '--i': 0 } as React.CSSProperties}>
        Réglages
      </h1>

      {/* Mes boutons de dépense */}
      <section className="rise mt-6" style={{ '--i': 1 } as React.CSSProperties}>
        <TitreSection>Mes boutons</TitreSection>
        <p className="mb-3 text-corps text-encre-2">
          Ce sont les raccourcis qui s'affichent quand tu appuies sur « J'ai dépensé ».
        </p>
        {erreur && !modeles ? (
          <MessageErreur texte={erreur} onReessayer={charger} />
        ) : !modeles ? (
          <Squelette hauteur="h-16" nombre={3} />
        ) : (
          <>
            {modeles.length > 0 && (
              <Liste>
                {modeles.map((m) => (
                  <li key={m._id} className="flex min-h-16 items-center gap-3 px-5 py-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: m.color || '#8a929c' }}
                    />
                    <p className="min-w-0 flex-1 text-corps font-medium text-encre">{m.label}</p>
                    <span className="text-corps text-encre-2">{m.defaultAmount} €</span>
                    <button
                      onClick={() => setEdition(m)}
                      className="h-12 shrink-0 rounded-champ px-3 text-corps font-semibold text-bleu-fonce transition-colors duration-100 hover:bg-papier-2"
                    >
                      Modifier
                    </button>
                  </li>
                ))}
              </Liste>
            )}
            <div className="mt-3">
              <BoutonSecondaire onClick={() => setEdition({ label: '', defaultAmount: 0, category: 'autre' })}>
                <Plus size={20} weight="bold" /> Ajouter un bouton
              </BoutonSecondaire>
            </div>
          </>
        )}
      </section>

      {/* Installation sur l'écran d'accueil */}
      {!estInstallee && (
        <section className="rise mt-8" style={{ '--i': 2 } as React.CSSProperties}>
          <TitreSection>Mettre sur l'écran d'accueil</TitreSection>
          <Carte>
            <p className="text-corps text-encre-2">
              Tu peux ajouter « Mes comptes » à côté de tes autres applications : elle s'ouvrira en
              plein écran, sans la barre du navigateur.
            </p>
            <p className="mt-3 text-corps text-encre">
              {surIphone ? (
                <>
                  Appuie sur le bouton <span className="font-semibold">Partager</span> en bas de
                  Safari, puis sur <span className="font-semibold">Sur l'écran d'accueil</span>.
                </>
              ) : (
                <>
                  Ouvre le menu du navigateur (les trois points), puis choisis{' '}
                  <span className="font-semibold">Installer l'application</span> ou{' '}
                  <span className="font-semibold">Ajouter à l'écran d'accueil</span>.
                </>
              )}
            </p>
          </Carte>
        </section>
      )}

      {/* Face ID */}
      <section className="rise mt-8" style={{ '--i': 3 } as React.CSSProperties}>
        <TitreSection>Ouvrir sans code</TitreSection>
        {!authApi.faceIdSupported() ? (
          <Carte>
            <p className="text-corps text-encre-2">
              Cette option n'est possible que depuis le site en ligne, sur un téléphone récent.
            </p>
          </Carte>
        ) : faceId ? (
          <Banniere ton="vert">
            <ScanSmiley size={22} weight="fill" className="shrink-0 text-vert" />
            <span className="text-corps">Tu peux déjà ouvrir avec ton visage sur cet appareil.</span>
          </Banniere>
        ) : (
          <>
            <p className="mb-3 text-corps text-encre-2">
              Tu pourras ouvrir tes comptes avec ton visage, sans taper ton code.
            </p>
            <BoutonSecondaire onClick={activerFaceId}>
              <ScanSmiley size={22} /> Ouvrir avec mon visage
            </BoutonSecondaire>
          </>
        )}
        {messageFaceId && <p className="mt-3 text-corps text-encre-2">{messageFaceId}</p>}
      </section>

      {/* Taille du texte */}
      <section className="rise mt-8" style={{ '--i': 3 } as React.CSSProperties}>
        <TitreSection>Taille du texte</TitreSection>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { mot: 'Normale', v: false },
            { mot: 'Plus grande', v: true },
          ].map((o) => (
            <button
              key={o.mot}
              onClick={() => setTexteGrand(o.v)}
              className={`flex h-16 items-center justify-center gap-2 rounded-champ border text-corps font-semibold transition-colors duration-100 ${
                texteGrand === o.v
                  ? 'border-bleu bg-bleu-clair text-bleu-fonce'
                  : 'border-trait-champ bg-papier text-encre hover:bg-papier-2'
              }`}
            >
              <TextAa size={o.v ? 26 : 20} /> {o.mot}
            </button>
          ))}
        </div>
      </section>

      {/* Changer d'utilisateur */}
      <section className="rise mt-8 mb-4" style={{ '--i': 4 } as React.CSSProperties}>
        <TitreSection>Cet appareil</TitreSection>
        <p className="mb-3 text-corps text-encre-2">
          Tu es connectée en tant que <span className="font-semibold text-encre">{profil.name}</span>. Tes
          comptes restent enregistrés.
        </p>
        <BoutonSecondaire onClick={onQuitter}>
          <SignOut size={20} /> Changer d'utilisateur
        </BoutonSecondaire>
      </section>

      {edition && (
        <FormulaireModele
          initial={edition}
          onFermer={() => setEdition(null)}
          onEnregistre={() => {
            setEdition(null)
            charger()
          }}
          onSupprimer={(m) => {
            setEdition(null)
            setASupprimer(m)
          }}
        />
      )}

      <FeuilleConfirmation
        ouverte={!!aSupprimer}
        titre="Supprimer ce bouton ?"
        rappel={aSupprimer ? `${aSupprimer.label}, ${aSupprimer.defaultAmount} €` : ''}
        phrase="Tes dépenses déjà notées ne changent pas."
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={supprimer}
      />
    </div>
  )
}

function FormulaireModele({
  initial,
  onFermer,
  onEnregistre,
  onSupprimer,
}: {
  initial: ExpenseTemplate
  onFermer: () => void
  onEnregistre: () => void
  onSupprimer: (m: ExpenseTemplate) => void
}) {
  const [m, setM] = useState<ExpenseTemplate>(initial)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function enregistrer() {
    if (!m.label.trim()) return
    setEnCours(true)
    setErreur(null)
    const corps = { ...m }
    try {
      if (m._id) await comptesApi.templates.update(m._id, corps)
      else await comptesApi.templates.create(corps)
      onEnregistre()
    } catch (e) {
      setErreur(messageErreur(e, 'Enregistrer'))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Feuille ouverte onFermer={onFermer} titre={m._id ? 'Modifier le bouton' : 'Nouveau bouton'}>
      <div className="space-y-5 pb-2">
        <Champ label="C'est quoi ?" aide="Ce mot s'affichera sur le bouton">
          <Texte
            value={m.label}
            placeholder="Ex. : Pharmacie"
            onChange={(e) => setM((p) => ({ ...p, label: e.target.value }))}
          />
        </Champ>

        <ChampMontant
          label="Montant habituel"
          aide="Tu pourras toujours le changer au moment de noter"
          valeur={m.defaultAmount || 0}
          onChange={(n) => setM((p) => ({ ...p, defaultAmount: n }))}
        />

        {erreur && <MessageErreur texte={erreur} />}

        <GrosBouton onClick={enregistrer} disabled={enCours || !m.label.trim()}>
          <Check size={22} weight="bold" /> {enCours ? 'Un instant…' : 'Enregistrer'}
        </GrosBouton>

        {m._id && (
          <button
            onClick={() => onSupprimer(m)}
            className="flex h-14 w-full items-center justify-center gap-2 text-corps font-semibold text-rouge"
          >
            <TrashSimple size={20} /> Supprimer ce bouton
          </button>
        )}
      </div>

    </Feuille>
  )
}
