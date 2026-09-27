/* Leg curl glissé : à la maison, ce sont les chaussettes qui remplacent la
   machine. Les photos libres montrent toutes un ballon de gym — qu'elle n'a
   pas — donc on dessine la vraie version. */

export default function SchemaSol({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 176" className={className} role="img" fill="none">
      <title>Leg curl glissé au sol, avec des chaussettes</title>

      {/* Le sol, en parquet : c'est lui qui doit être lisse */}
      <line x1="12" y1="146" x2="328" y2="146" stroke="var(--color-trait-lysa)" strokeWidth="5" strokeLinecap="round" />
      <g stroke="var(--color-trait-lysa)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
        <line x1="40" y1="158" x2="60" y2="158" />
        <line x1="80" y1="158" x2="100" y2="158" />
        <line x1="120" y1="158" x2="140" y2="158" />
        <line x1="160" y1="158" x2="180" y2="158" />
        <line x1="200" y1="158" x2="220" y2="158" />
        <line x1="240" y1="158" x2="260" y2="158" />
        <line x1="280" y1="158" x2="300" y2="158" />
      </g>

      {/* Position de départ, en pâle : jambes tendues */}
      <g stroke="var(--color-trait-lysa)" strokeWidth="9" strokeLinecap="round" opacity="0.8">
        <line x1="96" y1="140" x2="176" y2="100" />
        <line x1="176" y1="100" x2="248" y2="140" />
      </g>

      {/* Position d'arrivée : les talons reviennent vers les fesses */}
      <g stroke="var(--color-rose)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <line x1="62" y1="140" x2="96" y2="140" />
        <line x1="96" y1="140" x2="176" y2="100" />
        <line x1="176" y1="100" x2="150" y2="138" />
      </g>
      <circle cx="48" cy="138" r="14" fill="var(--color-rose)" />
      <circle cx="36" cy="128" r="7" fill="var(--color-rose)" />

      {/* Les chaussettes sous les talons */}
      <ellipse cx="148" cy="142" rx="15" ry="7" fill="var(--color-encre-lysa)" />
      <ellipse cx="250" cy="142" rx="15" ry="7" fill="var(--color-encre-lysa)" opacity="0.35" />

      {/* La flèche du glissement */}
      <g stroke="var(--color-rose-fonce)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="238" y1="160" x2="168" y2="160" strokeDasharray="5 5" />
        <path d="M176 154 L166 160 L176 166" />
      </g>

      {/* Les repères */}
      <g fontSize="13" fontWeight="600" fill="var(--color-encre-lysa-2)" fontFamily="var(--font-sans)">
        <g stroke="var(--color-rose)" strokeWidth="2" strokeLinecap="round">
          <line x1="150" y1="70" x2="170" y2="92" />
          <line x1="262" y1="118" x2="252" y2="136" />
        </g>
        <circle cx="148" cy="66" r="3.5" fill="var(--color-rose)" stroke="none" />
        <circle cx="262" cy="114" r="3.5" fill="var(--color-rose)" stroke="none" />
        <text x="148" y="44" textAnchor="middle">Hanches décollées,</text>
        <text x="148" y="58" textAnchor="middle">fesses serrées</text>
        <text x="262" y="92" textAnchor="middle">Chaussettes</text>
        <text x="262" y="106" textAnchor="middle">sous les talons</text>
      </g>
    </svg>
  )
}
