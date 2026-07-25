import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, ScanSmiley, Wallet } from '@phosphor-icons/react'
import { authApi, setToken } from '../../lib/comptes'
import type { ProfilePublic } from '../../lib/comptes'
import { messageErreur } from './lib/mots'
import { Banniere, Champ, Feuille, GrosBouton, LienAction, MessageErreur, Squelette, Texte } from './components/ui'
import PaveNumerique from './components/PaveNumerique'

const COULEURS = ['#1a56db', '#0c6b44', '#b42318', '#7c3aed', '#b45309', '#0e7490']

/** Choix du profil → code à 4 chiffres (ou Face ID). */
export default function AccesGate({
  onEntree,
  sessionExpiree,
}: {
  onEntree: (p: ProfilePublic) => void
  sessionExpiree?: boolean
}) {
  const [profils, setProfils] = useState<ProfilePublic[] | null>(null)
  const [choisi, setChoisi] = useState<ProfilePublic | null>(null)
  const [creation, setCreation] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const charger = () =>
    authApi.profiles().then(setProfils).catch((e) => setErreur(messageErreur(e)))
  useEffect(() => { charger() }, [])

  function entrer(token: string, p: ProfilePublic) {
    setToken(token)
    onEntree(p)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <header className="mb-8">
        <span className="grid h-14 w-14 place-items-center rounded-carte bg-bleu-clair text-bleu">
          <Wallet size={28} weight="fill" />
        </span>
        <h1 className="mt-4 text-titre-page font-bold tracking-tight text-encre">Mes comptes</h1>
        <p className="mt-1 text-corps text-encre-2">
          {choisi ? `Bonjour ${choisi.name}` : creation ? 'Créer mon accès' : 'Qui es-tu ?'}
        </p>
      </header>

      {sessionExpiree && !choisi && (
        <div className="mb-5">
          <Banniere ton="rouge">
            <span className="text-corps">Ta session a expiré. Retape ton code pour continuer.</span>
          </Banniere>
        </div>
      )}

      {erreur && !profils && <MessageErreur texte={erreur} onReessayer={charger} />}
      {!profils && !erreur && <Squelette hauteur="h-[88px]" nombre={2} />}

      {profils &&
        (creation || profils.length === 0 ? (
          <Creation
            onCree={entrer}
            onAnnuler={profils.length > 0 ? () => setCreation(false) : undefined}
          />
        ) : choisi ? (
          <Connexion profil={choisi} onEntree={entrer} onRetour={() => setChoisi(null)} />
        ) : (
          <div className="space-y-3">
            {profils.map((p) => (
              <button
                key={p._id}
                onClick={() => setChoisi(p)}
                className="flex h-[88px] w-full items-center gap-4 rounded-carte border border-trait-champ bg-papier px-5 text-left transition-colors duration-100 hover:bg-papier-2"
              >
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-titre-section font-bold text-papier"
                  style={{ backgroundColor: p.avatarColor }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 text-titre-section font-semibold text-encre">{p.name}</span>
                {p.hasFaceId && <ScanSmiley size={24} className="text-bleu" />}
              </button>
            ))}
            {profils.length < 5 && (
              <button
                onClick={() => setCreation(true)}
                className="flex h-16 w-full items-center justify-center gap-2 rounded-carte border border-dashed border-trait-champ text-corps font-semibold text-encre-2 transition-colors duration-100 hover:bg-papier-2"
              >
                <Plus size={20} weight="bold" /> Ajouter une personne
              </button>
            )}
          </div>
        ))}
    </div>
  )
}

function Connexion({
  profil,
  onEntree,
  onRetour,
}: {
  profil: ProfilePublic
  onEntree: (token: string, p: ProfilePublic) => void
  onRetour: () => void
}) {
  const [code, setCode] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function parCode(valeur = code) {
    if (valeur.length < 4) return
    setEnCours(true)
    setErreur(null)
    try {
      const { token, profile } = await authApi.login(profil._id, valeur)
      onEntree(token, profile)
    } catch (e) {
      setErreur(messageErreur(e))
      setCode('')
    } finally {
      setEnCours(false)
    }
  }

  async function parVisage() {
    setEnCours(true)
    setErreur(null)
    try {
      const { token, profile } = await authApi.loginFaceId(profil._id)
      onEntree(token, profile)
    } catch (e) {
      setErreur(messageErreur(e))
    } finally {
      setEnCours(false)
    }
  }

  // Valide automatiquement dès le 4e chiffre : un geste de moins.
  useEffect(() => {
    if (code.length === 4) parCode(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div>
      <button
        onClick={onRetour}
        className="mb-5 flex h-14 items-center gap-1.5 text-corps font-medium text-bleu-fonce"
      >
        <ArrowLeft size={18} weight="bold" /> Ce n'est pas moi
      </button>

      {profil.hasFaceId && authApi.faceIdSupported() && (
        <div className="mb-5">
          <GrosBouton onClick={parVisage} disabled={enCours}>
            <ScanSmiley size={24} weight="fill" /> Ouvrir avec mon visage
          </GrosBouton>
        </div>
      )}

      <p className="mb-3 text-corps font-medium text-encre">Mon code</p>
      {/* Points de progression : elle voit combien de chiffres sont tapés. */}
      <div className="mb-5 flex justify-center gap-3.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${
              code.length > i ? 'border-bleu bg-bleu' : 'border-trait-champ bg-papier'
            }`}
          />
        ))}
      </div>

      {erreur && (
        <p className="mb-4 text-center text-corps font-medium text-rouge">{erreur}</p>
      )}

      <PaveNumerique
        valeur={code}
        preRempli={false}
        code
        onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 4))}
      />
    </div>
  )
}

function Creation({
  onCree,
  onAnnuler,
}: {
  onCree: (token: string, p: ProfilePublic) => void
  onAnnuler?: () => void
}) {
  const [nom, setNom] = useState('')
  const [code, setCode] = useState('')
  const [couleur, setCouleur] = useState(COULEURS[0])
  const [ouvrirCode, setOuvrirCode] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  async function creer() {
    setEnCours(true)
    setErreur(null)
    try {
      const { token, profile } = await authApi.createProfile(nom.trim(), code, couleur)
      onCree(token, profile)
    } catch (e) {
      setErreur(messageErreur(e, 'Créer mon accès'))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="space-y-5">
      <Champ label="Ton prénom">
        <Texte value={nom} placeholder="Ex. : Martine" onChange={(e) => setNom(e.target.value)} />
      </Champ>

      <Champ label="Ton code" aide="4 chiffres, à retenir facilement">
        <button
          onClick={() => setOuvrirCode(true)}
          className="flex h-14 w-full items-center justify-between rounded-champ border border-trait-champ bg-papier px-4 text-corps text-encre transition-colors duration-100 hover:bg-papier-2"
        >
          <span className={code ? 'tracking-[0.4em]' : 'text-encre-3'}>
            {code ? '•'.repeat(code.length) : 'Appuie pour choisir'}
          </span>
          <span className="text-secondaire text-bleu-fonce">Modifier</span>
        </button>
      </Champ>

      <Champ label="Ta couleur">
        <div className="flex gap-2.5">
          {COULEURS.map((c) => (
            <button
              key={c}
              onClick={() => setCouleur(c)}
              aria-label={`Choisir cette couleur`}
              className={`h-12 w-12 rounded-full transition-transform duration-100 ${
                couleur === c ? 'ring-4 ring-encre ring-offset-2' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </Champ>

      {erreur && <MessageErreur texte={erreur} />}

      <GrosBouton onClick={creer} disabled={enCours || !nom.trim() || code.length < 4}>
        {enCours ? 'Un instant…' : 'Créer mon accès'}
      </GrosBouton>
      {onAnnuler && <LienAction onClick={onAnnuler}>Annuler</LienAction>}

      <Feuille ouverte={ouvrirCode} onFermer={() => setOuvrirCode(false)} titre="Choisis ton code">
        <div className="pb-2">
          <div className="mb-5 flex justify-center gap-3.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-4 w-4 rounded-full border-2 ${
                  code.length > i ? 'border-bleu bg-bleu' : 'border-trait-champ bg-papier'
                }`}
              />
            ))}
          </div>
          <PaveNumerique
            valeur={code}
            preRempli={false}
            code
            onChange={(v) => {
              const c = v.replace(/\D/g, '').slice(0, 4)
              // On ne referme qu'au passage à 4 chiffres : sinon chaque appui
              // supplémentaire refermait la feuille sans rien changer.
              if (c.length === 4 && code.length < 4) setTimeout(() => setOuvrirCode(false), 250)
              setCode(c)
            }}
          />
        </div>
      </Feuille>
    </div>
  )
}
