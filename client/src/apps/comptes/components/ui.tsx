import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

/* Design system clair de l'app Comptes.
   Règles : cibles ≥ 56px, texte ≥ 15px, aucune ombre (sauf feuille),
   aucun flou, aucune transparence sur du texte, une seule couleur d'accent. */

/** Feuille qui monte du bas. Plein écran sur mobile pour ne rien couper. */
export function Feuille({
  ouverte,
  onFermer,
  titre,
  pleinEcran = false,
  enTete,
  children,
}: {
  ouverte: boolean
  onFermer: () => void
  titre: string
  pleinEcran?: boolean
  enTete?: ReactNode
  children: ReactNode
}) {
  useEffect(() => {
    if (!ouverte) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onFermer()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ouverte, onFermer])

  if (!ouverte) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        aria-label="Fermer"
        onClick={onFermer}
        className="absolute inset-0 bg-[rgba(22,25,29,0.45)]"
      />
      <div
        className={`relative z-10 flex w-full max-w-xl flex-col overflow-y-auto rounded-t-feuille bg-papier px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(22,25,29,0.12)] ${
          pleinEcran ? 'h-[92dvh]' : 'max-h-[88dvh]'
        }`}
        style={{ animation: 'rise-in 0.22s cubic-bezier(0.2,0,0,1) forwards' }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-papier pt-5 pb-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-titre-page font-bold tracking-tight text-encre">{titre}</h2>
            {enTete}
          </div>
          <button
            onClick={onFermer}
            aria-label="Fermer"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-champ border border-trait-champ text-encre-2 transition-colors duration-100 hover:bg-papier-2"
          >
            <X size={22} weight="bold" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Champ avec label toujours visible au-dessus (jamais de placeholder-label). */
export function Champ({
  label,
  aide,
  children,
}: {
  label: string
  aide?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-corps font-medium text-encre">{label}</span>
      {children}
      {aide && <span className="text-secondaire text-encre-2">{aide}</span>}
    </label>
  )
}

const champBase =
  'h-14 w-full rounded-champ border border-trait-champ bg-papier px-4 text-corps text-encre outline-none transition-colors duration-100 placeholder:text-encre-3 focus:border-bleu focus:ring-2 focus:ring-bleu/25'

export function Texte(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${champBase} ${props.className ?? ''}`} />
}

/** Bouton principal — une seule occurrence par écran. */
export function GrosBouton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-16 w-full items-center justify-center gap-2.5 rounded-champ bg-bleu text-corps font-semibold text-papier transition-colors duration-100 hover:bg-bleu-fonce disabled:bg-papier-2 disabled:text-encre-3 ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

/** Action secondaire : bordure, jamais un aplat coloré. */
export function BoutonSecondaire({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-champ border border-trait-champ bg-papier text-corps font-semibold text-encre transition-colors duration-100 hover:bg-papier-2 ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

/** Bouton destructeur : bordure rouge sur blanc, jamais un bloc rouge plein. */
export function BoutonDanger({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-champ border border-rouge bg-papier text-corps font-semibold text-rouge transition-colors duration-100 hover:bg-rouge-clair ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

/** Lien-action discret, avec une vraie zone de 56px. */
export function LienAction({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-14 w-full items-center justify-center gap-1.5 text-corps font-semibold text-bleu-fonce transition-colors duration-100 hover:text-bleu ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function Carte({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-carte border border-trait bg-papier p-5 ${className}`}>{children}</div>
  )
}

export function TitreSection({ children }: { children: ReactNode }) {
  return <h2 className="mb-2.5 text-titre-section font-semibold text-encre">{children}</h2>
}

/** Liste encadrée, lignes séparées par un trait fin. */
export function Liste({ children }: { children: ReactNode }) {
  return (
    <ul className="divide-y divide-trait overflow-hidden rounded-carte border border-trait bg-papier">
      {children}
    </ul>
  )
}

/** Interrupteur avec les deux états écrits en toutes lettres. */
export function Interrupteur({
  actif,
  onChange,
  motActif,
  motInactif,
}: {
  actif: boolean
  onChange: (v: boolean) => void
  motActif: string
  motInactif: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={() => onChange(!actif)}
      className="flex h-14 w-full items-center justify-between gap-3 rounded-champ border border-trait-champ bg-papier px-4 transition-colors duration-100 hover:bg-papier-2"
    >
      <span className="text-corps text-encre">{actif ? motActif : motInactif}</span>
      <span
        className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-150 ${
          actif ? 'bg-bleu' : 'bg-trait-champ'
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-papier transition-[left] duration-150 ${
            actif ? 'left-[24px]' : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}

/** Bannière d'information ; sert aussi à proposer « Annuler » après une action. */
export function Banniere({
  ton = 'vert',
  children,
}: {
  ton?: 'vert' | 'rouge'
  children: ReactNode
}) {
  const styles =
    ton === 'vert'
      ? 'border-vert-trait bg-vert-clair text-encre'
      : 'border-rouge-trait bg-rouge-clair text-encre'
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rise flex items-center gap-3 rounded-carte border px-4 py-3.5 ${styles}`}
    >
      {children}
    </div>
  )
}

/** État vide : une phrase + une action, jamais une icône grise seule. */
export function RienPourLInstant({
  icone,
  titre,
  phrase,
  action,
}: {
  icone: ReactNode
  titre: string
  phrase: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-carte border border-trait bg-papier px-6 py-10 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-papier-2 text-encre-2">
        {icone}
      </span>
      <p className="mt-4 text-titre-section font-semibold text-encre">{titre}</p>
      <p className="mx-auto mt-1.5 max-w-[34ch] text-corps text-encre-2">{phrase}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Erreur : cause + action, en langage courant. */
export function MessageErreur({ texte, onReessayer }: { texte: string; onReessayer?: () => void }) {
  return (
    <div className="rounded-carte border border-rouge-trait bg-rouge-clair p-5">
      <p className="text-corps text-encre">{texte}</p>
      {onReessayer && (
        <div className="mt-4">
          <BoutonSecondaire onClick={onReessayer}>Réessayer</BoutonSecondaire>
        </div>
      )}
    </div>
  )
}

/** Squelettes clairs, aux dimensions du contenu réel. */
export function Squelette({ hauteur = 'h-20', nombre = 3 }: { hauteur?: string; nombre?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: nombre }).map((_, i) => (
        <div key={i} className={`skeleton ${hauteur} rounded-carte`} />
      ))}
    </div>
  )
}
