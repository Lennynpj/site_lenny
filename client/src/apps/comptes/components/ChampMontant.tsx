import { useState } from 'react'
import { Check } from '@phosphor-icons/react'
import { Champ, Feuille, GrosBouton } from './ui'
import PaveNumerique, { afficheSaisie, versNombre } from './PaveNumerique'

/* Champ « montant » unique de l'app : un bouton qui ouvre le pavé numérique.
   Le montant déjà enregistré est surligné et la première touche le REMPLACE
   (sinon on tape « 4500 » par-dessus « 4200 » et on obtient 42004500). */

export default function ChampMontant({
  label,
  aide,
  valeur,
  onChange,
  vide = 'Appuie pour indiquer',
  titreFeuille = 'Combien ?',
}: {
  label: string
  aide?: string
  valeur: number
  onChange: (n: number) => void
  vide?: string
  titreFeuille?: string
}) {
  const [ouvert, setOuvert] = useState(false)
  const [saisie, setSaisie] = useState('')
  const [preRempli, setPreRempli] = useState(true)

  function ouvrir() {
    setSaisie(valeur ? String(valeur).replace('.', ',') : '')
    setPreRempli(valeur > 0)
    setOuvert(true)
  }

  function valider() {
    onChange(versNombre(saisie))
    setOuvert(false)
  }

  return (
    <>
      <Champ label={label} aide={aide}>
        <button
          type="button"
          onClick={ouvrir}
          className="flex h-14 w-full items-center justify-between rounded-champ border border-trait-champ bg-papier px-4 text-corps text-encre transition-colors duration-100 hover:bg-papier-2"
        >
          <span className={valeur ? 'font-semibold' : 'text-encre-3'}>
            {valeur ? `${String(valeur).replace('.', ',')} €` : vide}
          </span>
          <span className="text-secondaire text-bleu-fonce">Modifier</span>
        </button>
      </Champ>

      <Feuille ouverte={ouvert} onFermer={() => setOuvert(false)} titre={titreFeuille}>
        <div className="pb-2">
          <p className="mb-1 text-center">
            <span
              className={`inline-block rounded-champ px-4 py-1.5 text-chiffre-saisie font-bold tracking-tight text-encre ${
                preRempli ? 'bg-bleu-clair' : ''
              }`}
            >
              {afficheSaisie(saisie)}
            </span>
          </p>
          <p className="mb-4 text-center text-secondaire text-encre-2">
            {preRempli ? 'Appuie sur les chiffres pour changer' : 'Appuie sur les chiffres'}
          </p>

          <PaveNumerique
            valeur={saisie}
            preRempli={preRempli}
            onChange={(v) => {
              setSaisie(v)
              setPreRempli(false)
            }}
            onValider={valider}
          />

          <div className="mt-4">
            <GrosBouton onClick={valider}>
              <Check size={22} weight="bold" /> C'est bon
            </GrosBouton>
          </div>
        </div>
      </Feuille>
    </>
  )
}
