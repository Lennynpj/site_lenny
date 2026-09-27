/* Hip thrust à la maison : le canapé remplace le banc.
   C'est le seul exercice du programme dont le montage n'est pas évident —
   une photo de salle montre un banc et une barre, ce qui n'aide pas. D'où ce
   schéma dessiné, avec les trois repères qui comptent. */

export default function SchemaCanape({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 208" className={className} role="img" fill="none">
      <title>Position du hip thrust sur un canapé</title>

      {/* Sol */}
      <line x1="12" y1="176" x2="328" y2="176" stroke="var(--color-trait-lysa)" strokeWidth="5" strokeLinecap="round" />

      {/* Canapé : assise + dossier + pied */}
      <g fill="var(--color-petale)" stroke="var(--color-trait-lysa)" strokeWidth="3" strokeLinejoin="round">
        <rect x="238" y="46" width="34" height="80" rx="8" />
        <rect x="196" y="104" width="120" height="34" rx="10" />
        <rect x="204" y="138" width="10" height="34" rx="4" />
        <rect x="296" y="138" width="10" height="34" rx="4" />
      </g>

      {/* Le bonhomme : épaules sur le bord de l'assise, hanches en haut,
          tibias verticaux. C'est la ligne épaules → hanches → genoux qui fait
          tout l'exercice. */}
      <g stroke="var(--color-rose)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <line x1="196" y1="100" x2="124" y2="110" />
        <line x1="124" y1="110" x2="86" y2="118" />
        <line x1="86" y1="118" x2="86" y2="170" />
        <line x1="70" y1="172" x2="104" y2="172" />
        <line x1="196" y1="100" x2="168" y2="86" />
      </g>
      <circle cx="214" cy="92" r="15" fill="var(--color-rose)" />
      <circle cx="228" cy="80" r="8" fill="var(--color-rose)" />

      {/* L'haltère, posé sur le haut des hanches et tenu à deux mains */}
      <rect x="104" y="88" width="42" height="17" rx="8.5" fill="var(--color-encre-lysa)" />

      {/* Le mouvement : les hanches descendent et remontent */}
      <g stroke="var(--color-rose-fonce)" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round">
        <line x1="124" y1="126" x2="124" y2="156" />
      </g>
      <path d="M118 132 L124 124 L130 132" stroke="var(--color-rose-fonce)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M118 150 L124 158 L130 150" stroke="var(--color-rose-fonce)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Les trois repères */}
      <g fontSize="13" fontWeight="600" fill="var(--color-encre-lysa-2)" fontFamily="var(--font-sans)">
        <g stroke="var(--color-rose)" strokeWidth="2" strokeLinecap="round">
          <line x1="196" y1="62" x2="196" y2="92" />
          <line x1="125" y1="62" x2="125" y2="82" />
          <line x1="52" y1="150" x2="70" y2="168" />
        </g>
        <circle cx="196" cy="58" r="3.5" fill="var(--color-rose)" stroke="none" />
        <circle cx="125" cy="58" r="3.5" fill="var(--color-rose)" stroke="none" />
        <circle cx="49" cy="146" r="3.5" fill="var(--color-rose)" stroke="none" />

        <text x="192" y="40" textAnchor="end">Haut du dos</text>
        <text x="192" y="55" textAnchor="end">sur le bord</text>
        <text x="129" y="40">Haltère sur</text>
        <text x="129" y="55">les hanches</text>
        <text x="14" y="136">Pieds à plat,</text>
        <text x="14" y="151">sous les genoux</text>
      </g>
    </svg>
  )
}
