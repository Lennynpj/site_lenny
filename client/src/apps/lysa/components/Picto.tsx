/* Les dessins des exercices.
   Chaque mouvement est décrit par DEUX poses — le début et la fin — et un
   seul bonhomme les rend. Les alterner donne une vraie petite animation du
   geste : c'est plus juste qu'une photo de salle, parce qu'on dessine la
   version faite à la maison, avec des haltères et un canapé. */

type Point = [number, number]

interface Pose {
  tete: Point
  epaule: Point
  hanche: Point
  genou: Point
  cheville: Point
  coude?: Point
  main?: Point
  /** Deuxième jambe (fentes, mountain climbers). */
  genou2?: Point
  cheville2?: Point
  halteres?: boolean
  chargeHanches?: boolean
  appui?: { x: number; y: number; l: number; h: number }
}

/** a = position de départ, b = position de travail (celle qu'on montre fixe). */
type Mouvement = { a: Pose; b: Pose }

const CANAPE = { x: 88, y: 66, l: 28, h: 36 }

const MOUVEMENTS: Record<string, Mouvement> = {
  squat: {
    a: {
      tete: [60, 24], epaule: [58, 42], hanche: [58, 68], genou: [58, 86], cheville: [58, 102],
      coude: [70, 52], main: [62, 52], halteres: true,
    },
    b: {
      tete: [60, 28], epaule: [56, 47], hanche: [43, 70], genou: [70, 76], cheville: [60, 100],
      coude: [66, 58], main: [59, 60], halteres: true,
    },
  },
  fente: {
    a: {
      tete: [60, 24], epaule: [58, 42], hanche: [58, 68], genou: [58, 86], cheville: [58, 102],
      coude: [62, 56], main: [64, 72], halteres: true,
    },
    b: {
      tete: [62, 26], epaule: [60, 44], hanche: [58, 68], genou: [78, 80], cheville: [80, 100],
      genou2: [38, 90], cheville2: [28, 100], coude: [64, 60], main: [64, 76], halteres: true,
    },
  },
  charniere: {
    a: {
      tete: [58, 24], epaule: [58, 42], hanche: [58, 66], genou: [58, 84], cheville: [58, 102],
      coude: [58, 56], main: [60, 70], halteres: true,
    },
    b: {
      tete: [86, 42], epaule: [70, 47], hanche: [40, 55], genou: [40, 78], cheville: [42, 100],
      coude: [70, 64], main: [70, 80], halteres: true,
    },
  },
  hipthrust: {
    a: {
      tete: [98, 52], epaule: [84, 62], hanche: [56, 88], genou: [42, 82], cheville: [44, 100],
      coude: [72, 72], main: [58, 84], chargeHanches: true, appui: CANAPE,
    },
    b: {
      tete: [98, 50], epaule: [84, 60], hanche: [56, 62], genou: [42, 80], cheville: [44, 100],
      coude: [72, 56], main: [58, 58], chargeHanches: true, appui: CANAPE,
    },
  },
  tirage: {
    a: {
      tete: [86, 44], epaule: [70, 49], hanche: [40, 57], genou: [40, 79], cheville: [42, 100],
      coude: [72, 70], main: [72, 86], halteres: true,
    },
    b: {
      tete: [86, 44], epaule: [70, 49], hanche: [40, 57], genou: [40, 79], cheville: [42, 100],
      coude: [76, 62], main: [68, 54], halteres: true,
    },
  },
  pousse: {
    a: {
      tete: [30, 84], epaule: [46, 86], hanche: [78, 88], genou: [94, 72], cheville: [100, 94],
      coude: [40, 70], main: [56, 66], halteres: true,
    },
    b: {
      tete: [30, 84], epaule: [46, 86], hanche: [78, 88], genou: [94, 72], cheville: [100, 94],
      coude: [48, 66], main: [50, 48], halteres: true,
    },
  },
  epaules: {
    a: {
      tete: [58, 32], epaule: [58, 51], hanche: [58, 76], genou: [58, 90], cheville: [58, 102],
      coude: [74, 60], main: [74, 44], halteres: true,
    },
    b: {
      tete: [58, 32], epaule: [58, 51], hanche: [58, 76], genou: [58, 90], cheville: [58, 102],
      coude: [76, 44], main: [76, 24], halteres: true,
    },
  },
  pompe: {
    a: {
      tete: [28, 54], epaule: [44, 59], hanche: [78, 68], genou: [94, 78], cheville: [104, 90],
      coude: [44, 78], main: [42, 96],
    },
    b: {
      tete: [28, 66], epaule: [44, 71], hanche: [78, 76], genou: [94, 84], cheville: [104, 94],
      coude: [56, 86], main: [42, 96],
    },
  },
  legcurl: {
    a: {
      tete: [22, 96], epaule: [38, 94], hanche: [72, 76], genou: [88, 86], cheville: [102, 98],
    },
    b: {
      tete: [22, 96], epaule: [38, 94], hanche: [72, 72], genou: [58, 88], cheville: [48, 100],
    },
  },
  gainage: {
    a: {
      tete: [28, 64], epaule: [44, 69], hanche: [78, 77], genou: [94, 85], cheville: [104, 94],
      coude: [42, 94], main: [26, 94],
    },
    b: {
      tete: [28, 64], epaule: [44, 69], hanche: [78, 77], genou: [94, 85], cheville: [104, 94],
      coude: [42, 94], main: [26, 94],
    },
  },
  rotation: {
    a: {
      tete: [48, 32], epaule: [52, 51], hanche: [44, 84], genou: [74, 84], cheville: [90, 96],
      coude: [40, 58], main: [28, 62], halteres: true,
    },
    b: {
      tete: [48, 32], epaule: [52, 51], hanche: [44, 84], genou: [74, 84], cheville: [90, 96],
      coude: [70, 56], main: [80, 50], halteres: true,
    },
  },
  climbers: {
    a: {
      tete: [26, 62], epaule: [42, 67], hanche: [78, 76], genou: [96, 84], cheville: [106, 94],
      genou2: [56, 84], cheville2: [64, 98], coude: [40, 94], main: [34, 96],
    },
    b: {
      tete: [26, 62], epaule: [42, 67], hanche: [78, 76], genou: [56, 84], cheville: [64, 98],
      genou2: [96, 84], cheville2: [106, 94], coude: [40, 94], main: [34, 96],
    },
  },
  crunch: {
    a: {
      tete: [26, 82], epaule: [42, 88], hanche: [74, 92], genou: [88, 72], cheville: [100, 92],
      coude: [34, 90], main: [30, 82],
    },
    b: {
      tete: [32, 70], epaule: [44, 82], hanche: [74, 92], genou: [88, 72], cheville: [100, 92],
      coude: [36, 78], main: [34, 68],
    },
  },
}

const PAR_DEFAUT = 'squat'
const mouvement = (p?: string) => MOUVEMENTS[p ?? ''] ?? MOUVEMENTS[PAR_DEFAUT]

function Bonhomme({ pose, pale = false }: { pose: Pose; pale?: boolean }) {
  const l = (a: Point, b: Point) => ({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] })
  const trait = pale ? 'var(--color-trait-lysa)' : 'var(--color-rose)'
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {pose.appui && (
        <rect
          x={pose.appui.x} y={pose.appui.y} width={pose.appui.l} height={pose.appui.h} rx="6"
          fill="var(--color-petale)" stroke="var(--color-trait-lysa)" strokeWidth="3"
        />
      )}
      <g stroke={trait} strokeWidth="6.5">
        {pose.genou2 && pose.cheville2 && (
          <g stroke="var(--color-trait-lysa)">
            <line {...l(pose.hanche, pose.genou2)} />
            <line {...l(pose.genou2, pose.cheville2)} />
          </g>
        )}
        <line {...l(pose.epaule, pose.hanche)} />
        <line {...l(pose.hanche, pose.genou)} />
        <line {...l(pose.genou, pose.cheville)} />
        {pose.coude && <line {...l(pose.epaule, pose.coude)} />}
        {pose.coude && pose.main && <line {...l(pose.coude, pose.main)} />}
      </g>
      {/* Le chignon derrière, le visage par-dessus */}
      <circle cx={pose.tete[0] - 9} cy={pose.tete[1] - 6} r="5" fill={trait} />
      <circle cx={pose.tete[0]} cy={pose.tete[1]} r="10" fill={trait} />
      {pose.halteres && pose.main && (
        <rect
          x={pose.main[0] - 9} y={pose.main[1] - 4.5} width="18" height="9" rx="4.5"
          fill={pale ? 'var(--color-trait-lysa)' : 'var(--color-encre-lysa)'}
        />
      )}
      {pose.chargeHanches && (
        <rect
          x={pose.hanche[0] - 11} y={pose.hanche[1] - 13} width="22" height="10" rx="5"
          fill={pale ? 'var(--color-trait-lysa)' : 'var(--color-encre-lysa)'}
        />
      )}
    </g>
  )
}

function Sol() {
  return <line x1="14" y1="106" x2="106" y2="106" stroke="var(--color-trait-lysa)" strokeWidth="5" strokeLinecap="round" />
}

/** Dessin fixe : la position de travail, celle qui se reconnaît le mieux. */
export default function Picto({
  pattern,
  className = '',
  anime = false,
}: {
  pattern?: string
  className?: string
  anime?: boolean
}) {
  const m = mouvement(pattern)
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-hidden="true">
      <Sol />
      <g className={anime ? 'respire' : undefined} style={{ transformOrigin: '60px 60px' }}>
        <Bonhomme pose={m.b} />
      </g>
    </svg>
  )
}

/** Le geste animé : les deux positions s'alternent, comme un gif dessiné.
    L'autre position reste en rose très pâle derrière — on voit d'un coup d'œil
    l'amplitude du mouvement, même quand les animations sont coupées.
    `fond` doit valoir la couleur du bloc qui l'entoure : la deuxième image
    masque la première, il lui faut un fond opaque. */
export function PictoAnime({
  pattern,
  className = '',
  fond = 'var(--color-petale-2)',
}: {
  pattern?: string
  className?: string
  fond?: string
}) {
  const m = mouvement(pattern)
  const statique = JSON.stringify(m.a) === JSON.stringify(m.b)
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-hidden="true">
      <Sol />
      {!statique && (
        <g opacity="0.16">
          <Bonhomme pose={m.b} pale />
        </g>
      )}
      <Bonhomme pose={m.a} />
      {!statique && (
        <g className="photo-alterne">
          <rect x="0" y="0" width="120" height="120" fill={fond} />
          <Sol />
          <g opacity="0.16">
            <Bonhomme pose={m.a} pale />
          </g>
          <Bonhomme pose={m.b} />
        </g>
      )}
    </svg>
  )
}
