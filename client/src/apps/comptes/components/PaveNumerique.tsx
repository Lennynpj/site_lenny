import { useCallback, useEffect, useState } from 'react'
import { Backspace } from '@phosphor-icons/react'

/* Pavé numérique maison.
   Pourquoi pas le clavier du téléphone : ses touches font 40 px, il RECOUVRE
   le bouton de validation (on tape puis on ne trouve plus quoi faire), et il
   gère mal la virgule française. Ici : touches de 72 px, disposition d'un
   téléphone fixe, et aucun <input> donc aucun clavier système ne s'ouvre.

   Mode remplacement : le montant pré-rempli est surligné ; la première touche
   l'efface entièrement. */

const NOMS: Record<string, string> = {
  '0': 'zéro', '1': 'un', '2': 'deux', '3': 'trois', '4': 'quatre',
  '5': 'cinq', '6': 'six', '7': 'sept', '8': 'huit', '9': 'neuf',
}

export default function PaveNumerique({
  valeur,
  onChange,
  preRempli,
  onValider,
  sansVirgule = false,
}: {
  /** Chaîne, pas un nombre : « 12, » est un état intermédiaire valide. */
  valeur: string
  onChange: (v: string) => void
  /** true tant que l'utilisatrice n'a pas touché au montant proposé. */
  preRempli: boolean
  onValider?: () => void
  /** Saisie d'un code : la virgule n'a pas lieu d'être affichée. */
  sansVirgule?: boolean
}) {
  const [presse, setPresse] = useState<string | null>(null)

  const decimales = valeur.split(',')[1]?.length ?? 0
  const virguleBloquee = valeur.includes(',') || valeur === ''
  const entiers = valeur.split(',')[0].length

  const taper = useCallback(
    (touche: string) => {
      // La première frappe remplace intégralement le montant proposé.
      const base = preRempli ? '' : valeur

      if (touche === 'effacer') {
        onChange(base.slice(0, -1))
        return
      }
      if (touche === ',') {
        if (base.includes(',') || base === '') return
        onChange(base + ',')
        return
      }
      if ((base.split(',')[1]?.length ?? 0) >= 2) return // max 2 décimales
      if (!base.includes(',') && base.split(',')[0].length >= 6) return // max 6 entiers
      if (base === '0') {
        onChange(touche) // évite « 05 »
        return
      }
      onChange(base + touche)
    },
    [valeur, preRempli, onChange]
  )

  // Clavier physique (usage PC)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      let touche: string | null = null
      if (/^[0-9]$/.test(e.key)) touche = e.key
      else if (e.key === ',' || e.key === '.') touche = ','
      else if (e.key === 'Backspace') touche = 'effacer'
      else if (e.key === 'Enter' && onValider) {
        e.preventDefault()
        onValider()
        return
      }
      if (!touche) return
      e.preventDefault()
      taper(touche)
      setPresse(touche)
      setTimeout(() => setPresse(null), 120)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [taper, onValider])

  const touches = ['1', '2', '3', '4', '5', '6', '7', '8', '9', sansVirgule ? '' : ',', '0', 'effacer']

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {touches.map((t, i) => {
        if (t === '') return <span key={`vide${i}`} />
        const estEffacer = t === 'effacer'
        const desactivee =
          (t === ',' && virguleBloquee) ||
          (!estEffacer && t !== ',' && decimales >= 2) ||
          (!estEffacer && t !== ',' && !valeur.includes(',') && entiers >= 6 && !preRempli)
        return (
          <button
            key={t}
            type="button"
            disabled={desactivee}
            aria-label={estEffacer ? 'effacer un chiffre' : t === ',' ? 'virgule' : NOMS[t]}
            onClick={() => taper(t)}
            className={`flex h-[72px] flex-col items-center justify-center rounded-champ border text-touche font-semibold transition-colors duration-75 ${
              presse === t
                ? 'border-bleu bg-bleu-clair text-bleu-fonce'
                : 'border-trait-champ bg-papier text-encre active:border-bleu active:bg-bleu-clair'
            } disabled:border-trait disabled:text-encre-3`}
          >
            {estEffacer ? (
              <>
                <Backspace size={26} weight="regular" />
                <span className="mt-0.5 text-[13px] font-medium">Effacer</span>
              </>
            ) : (
              t
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Convertit la saisie (« 12,50 ») en nombre. */
export function versNombre(v: string): number {
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Affiche la saisie en cours, avec le « € » collé. */
export function afficheSaisie(v: string): string {
  return `${v === '' ? '0' : v} €`
}
