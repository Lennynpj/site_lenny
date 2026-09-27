import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

/* Briques du thème de Lysa : rose bonbon, angles très ronds, cibles ≥ 56px.
   Un seul accent (le rose) : tout le reste est du blanc et de l'encre chaude. */

const pileFeuilles: string[] = []

/** Feuille qui monte du bas. Portail obligatoire : la page anime des
    transform, et `fixed` s'y accrocherait au lieu de couvrir l'écran. */
export function Feuille({
  ouverte,
  onFermer,
  titre,
  children,
}: {
  ouverte: boolean
  onFermer: () => void
  titre: string
  children: ReactNode
}) {
  const id = useId()

  useEffect(() => {
    if (!ouverte) return
    pileFeuilles.push(id)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pileFeuilles.at(-1) === id) onFermer()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      const i = pileFeuilles.lastIndexOf(id)
      if (i !== -1) pileFeuilles.splice(i, 1)
    }
  }, [ouverte, onFermer, id])

  if (!ouverte) return null

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={onFermer} className="absolute inset-0 bg-[rgba(61,36,48,0.42)]" />
      <div
        className="relative z-10 flex max-h-[90dvh] w-full max-w-xl flex-col overflow-y-auto rounded-t-[32px] bg-nuage px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(209,58,111,0.2)]"
        style={{ animation: 'rise-in 0.24s cubic-bezier(0.2,0,0,1) forwards' }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-nuage pt-5 pb-4">
          <h2 className="font-rond min-w-0 flex-1 text-[26px] leading-tight font-bold text-encre-lysa">
            {titre}
          </h2>
          <button
            onClick={onFermer}
            aria-label="Fermer"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-petale text-rose-fonce transition-transform duration-100 active:scale-95"
          >
            <X size={22} weight="bold" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}

/** Bouton principal — un seul par écran. */
export function BoutonRose({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`font-rond flex h-16 w-full items-center justify-center gap-2.5 rounded-[22px] bg-rose text-[21px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(209,58,111,0.6)] transition-transform duration-100 active:scale-[0.98] disabled:bg-petale disabled:text-encre-lysa-2 disabled:shadow-none ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

/** Action secondaire : rose pâle, jamais un aplat vif. */
export function BoutonDoux({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-petale text-[17px] font-semibold text-rose-fonce transition-transform duration-100 active:scale-[0.98] ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function Carte({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`carte-bonbon rounded-bonbon p-5 ${className}`}>{children}</div>
}

export function TitreSection({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-rond mb-3 text-[22px] font-bold text-encre-lysa">{children}</h2>
  )
}

export function MessageErreur({ texte, onReessayer }: { texte: string; onReessayer?: () => void }) {
  return (
    <div className="rounded-bonbon border-2 border-trait-lysa bg-petale-2 p-5">
      <p className="text-[17px] text-encre-lysa">{texte}</p>
      {onReessayer && (
        <div className="mt-4">
          <BoutonDoux onClick={onReessayer}>Réessayer</BoutonDoux>
        </div>
      )}
    </div>
  )
}

export function Squelette({ hauteur = 'h-24', nombre = 3 }: { hauteur?: string; nombre?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: nombre }).map((_, i) => (
        <div key={i} className={`skeleton ${hauteur} rounded-bonbon`} />
      ))}
    </div>
  )
}
