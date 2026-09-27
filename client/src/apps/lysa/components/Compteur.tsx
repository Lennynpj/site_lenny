import { Minus, Plus } from '@phosphor-icons/react'

/* Saisie d'un nombre sans clavier.
   Le clavier système est le pire ennemi d'une appli de sport : il recouvre
   la moitié de l'écran, il faut viser un petit champ et penser à le refermer,
   avec les mains moites entre deux séries. Ici : deux grosses touches. */

export default function Compteur({
  label,
  valeur,
  onChange,
  pas = 1,
  min = 0,
  max = 999,
  suffixe,
  rappel,
}: {
  label: string
  valeur: number
  onChange: (n: number) => void
  pas?: number
  min?: number
  max?: number
  suffixe?: string
  rappel?: string
}) {
  const borne = (n: number) => Math.min(max, Math.max(min, Math.round(n * 2) / 2))

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[17px] font-semibold text-encre-lysa">{label}</span>
        {rappel && <span className="text-[15px] text-encre-lysa-2">{rappel}</span>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(borne(valeur - pas))}
          disabled={valeur <= min}
          aria-label={`Diminuer : ${label}`}
          className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] bg-petale text-rose-fonce transition-transform duration-100 active:scale-95 disabled:opacity-40"
        >
          <Minus size={26} weight="bold" />
        </button>

        <div
          aria-live="polite"
          className="font-rond flex h-16 flex-1 items-baseline justify-center gap-1.5 rounded-[20px] bg-petale-2 text-encre-lysa"
        >
          <span className="text-[38px] leading-none font-bold tabular-nums">
            {Number.isInteger(valeur) ? valeur : valeur.toFixed(1).replace('.', ',')}
          </span>
          {suffixe && <span className="text-[19px] font-semibold text-encre-lysa-2">{suffixe}</span>}
        </div>

        <button
          type="button"
          onClick={() => onChange(borne(valeur + pas))}
          disabled={valeur >= max}
          aria-label={`Augmenter : ${label}`}
          className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] bg-petale text-rose-fonce transition-transform duration-100 active:scale-95 disabled:opacity-40"
        >
          <Plus size={26} weight="bold" />
        </button>
      </div>
    </div>
  )
}
