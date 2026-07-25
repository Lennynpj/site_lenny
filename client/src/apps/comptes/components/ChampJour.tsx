import { useState } from 'react'
import { Champ, Feuille } from './ui'
import { jourDuMois } from '../lib/mots'

/* Choix du jour du mois. Un calendrier de 31 cases plutôt qu'un champ
   numérique : aucun clavier ne s'ouvre, les cibles font 56px, et un seul
   appui suffit (pas de « valider » derrière). */

export default function ChampJour({
  label,
  aide,
  valeur,
  onChange,
  titreFeuille = 'Quel jour du mois ?',
}: {
  label: string
  aide?: string
  valeur: number
  onChange: (j: number) => void
  titreFeuille?: string
}) {
  const [ouvert, setOuvert] = useState(false)

  return (
    <>
      <Champ label={label} aide={aide}>
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="flex h-14 w-full items-center justify-between rounded-champ border border-trait-champ bg-papier px-4 text-corps text-encre transition-colors duration-100 hover:bg-papier-2"
        >
          <span className="font-semibold first-letter:uppercase">{jourDuMois(valeur)}</span>
          <span className="text-secondaire text-bleu-fonce">Modifier</span>
        </button>
      </Champ>

      <Feuille ouverte={ouvert} onFermer={() => setOuvert(false)} titre={titreFeuille}>
        <div className="pb-2">
          <p className="mb-4 text-secondaire text-encre-2">
            Appuie sur le jour. Si tu ne sais pas exactement, une date approchante suffit.
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((j) => (
              <button
                key={j}
                onClick={() => {
                  onChange(j)
                  setOuvert(false)
                }}
                aria-label={jourDuMois(j)}
                aria-pressed={valeur === j}
                className={`h-14 rounded-champ text-corps font-semibold transition-colors duration-100 ${
                  valeur === j
                    ? 'bg-bleu text-papier'
                    : 'border border-trait-champ text-encre hover:bg-papier-2'
                }`}
              >
                {j}
              </button>
            ))}
          </div>
        </div>
      </Feuille>
    </>
  )
}
