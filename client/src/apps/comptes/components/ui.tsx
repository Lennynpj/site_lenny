import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

/** Bottom-sheet modale, mobile-first. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: 'rise-in 0.2s ease' }}
      />
      <div
        className="relative z-10 max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-zinc-900 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl"
        style={{ animation: 'rise-in 0.28s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-white active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Bloc label + champ (label au-dessus). */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{label}</span>
      {children}
    </label>
  )
}

const inputBase =
  'h-12 w-full rounded-xl border border-zinc-700/70 bg-zinc-800/60 px-3.5 text-[15px] text-white transition outline-none placeholder:text-zinc-600 focus:border-emerald-400/70'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />
}

/** Champ montant avec suffixe € intégré. */
export function MoneyInput({
  value,
  onChange,
  autoFocus,
}: {
  value: number | ''
  onChange: (n: number) => void
  autoFocus?: boolean
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={0.01}
        autoFocus={autoFocus}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${inputBase} pr-9 font-mono text-lg tabular-nums`}
      />
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-sm text-zinc-500">
        €
      </span>
    </div>
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputBase} appearance-none bg-[length:0] pr-3 ${props.className ?? ''}`}
    />
  )
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3.5 font-semibold text-zinc-950 transition duration-200 active:scale-[0.98] disabled:opacity-50 ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

/** État vide composé. */
export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-zinc-800/60 bg-zinc-900/50 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400">
        {icon}
      </span>
      <p className="mt-4 font-semibold text-white">{title}</p>
      {hint && <p className="mt-1 max-w-64 text-sm text-zinc-500">{hint}</p>}
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return <p className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">{message}</p>
}

export function CardSkeleton({ count = 3, h = 'h-20' }: { count?: number; h?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${h} rounded-2xl`} />
      ))}
    </div>
  )
}
