import { BoutonDanger, BoutonSecondaire, Feuille } from './ui'

/* Remplace window.confirm() : boîte minuscule, texte 13 px, boutons de 30 px,
   apparence différente selon le navigateur. Ici : boutons empilés de 56 px,
   action sûre en premier, rappel complet de ce qui va être supprimé. */

export default function FeuilleConfirmation({
  ouverte,
  titre,
  rappel,
  phrase,
  motGarder = 'Non, garder',
  motSupprimer = 'Oui, supprimer',
  onAnnuler,
  onConfirmer,
}: {
  ouverte: boolean
  titre: string
  /** Ce qui va être supprimé, écrit en toutes lettres. */
  rappel: string
  phrase?: string
  motGarder?: string
  motSupprimer?: string
  onAnnuler: () => void
  onConfirmer: () => void
}) {
  return (
    <Feuille ouverte={ouverte} onFermer={onAnnuler} titre={titre}>
      <div className="pb-2">
        <p className="rounded-carte border border-trait bg-papier-2 px-4 py-3.5 text-corps font-medium text-encre">
          {rappel}
        </p>
        {phrase && <p className="mt-3 text-corps text-encre-2">{phrase}</p>}

        <div className="mt-6 space-y-3">
          <BoutonSecondaire onClick={onAnnuler}>{motGarder}</BoutonSecondaire>
          <BoutonDanger onClick={onConfirmer}>{motSupprimer}</BoutonDanger>
        </div>
      </div>
    </Feuille>
  )
}
