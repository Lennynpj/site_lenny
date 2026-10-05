import { useEffect, useRef } from 'react'

/* Un chapitre du film.
   La section est haute (plusieurs écrans) et sa scène reste collée à l'écran
   pendant qu'on la traverse : la position dans la section pilote la vidéo
   image par image. Faire défiler, c'est avancer dans le plan — c'est ce qui
   donne l'impression de regarder un film plutôt que de lire une page.
   Tout se fait sans état React : on écrit directement dans la vidéo et dans
   le style des légendes, une fois par image, et seulement quand le chapitre
   est à proximité de l'écran. */

export type Legende = {
  /** Fenêtre d'apparition, en fraction du chapitre (0 → 1). */
  de: number
  a: number
  surtitre?: string
  titre?: string
  texte?: string
  position?: 'bas-gauche' | 'haut-gauche' | 'bas-droite' | 'centre'
}

const PLACEMENT: Record<NonNullable<Legende['position']>, string> = {
  'bas-gauche': 'items-end justify-start text-left',
  'haut-gauche': 'items-start justify-start text-left pt-28',
  'bas-droite': 'items-end justify-end text-right',
  centre: 'items-center justify-center text-center',
}

/** Opacité d'une légende : fondu d'entrée et de sortie sur 8 % du chapitre. */
function opacite(p: number, de: number, a: number) {
  const f = 0.08
  if (p < de || p > a) return 0
  return Math.min(1, (p - de) / f, (a - p) / f)
}

export default function Chapitre({
  id,
  video,
  affiche,
  ecrans = 3,
  legendes,
  alt,
}: {
  id: string
  video: string
  affiche: string
  /** Hauteur du chapitre en écrans : plus c'est long, plus le plan est lent. */
  ecrans?: number
  legendes: Legende[]
  alt: string
}) {
  const section = useRef<HTMLElement>(null)
  const film = useRef<HTMLVideoElement>(null)
  const textes = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = section.current
    const v = film.current
    if (!el || !v) return
    const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let image = 0
    let pret = false
    const maj = () => {
      image = 0
      const r = el.getBoundingClientRect()
      // On ne télécharge un chapitre qu'à l'approche (2,5 écrans avant) :
      // charger les sept films d'un coup coûterait ~35 Mo dès l'arrivée.
      // iOS ne laisse déplacer la tête de lecture qu'une fois la vidéo
      // « démarrée » : une lecture muette aussitôt mise en pause suffit.
      if (!pret && r.top < window.innerHeight * 2.5) {
        pret = true
        v.preload = 'auto'
        v.play().then(() => v.pause()).catch(() => {})
      }
      // Hors écran : rien à faire.
      if (r.bottom < -window.innerHeight || r.top > window.innerHeight * 2) return
      const course = r.height - window.innerHeight
      const p = Math.min(1, Math.max(0, -r.top / course))
      if (!calme && v.duration) {
        const t = p * (v.duration - 0.05)
        if (Math.abs(v.currentTime - t) > 1 / 30) v.currentTime = t
      }
      legendes.forEach((l, i) => {
        const n = textes.current[i]
        if (!n) return
        const o = opacite(p, l.de, l.a)
        n.style.opacity = String(o)
        n.style.transform = `translateY(${(1 - o) * 14}px)`
      })
    }
    const demande = () => {
      if (!image) image = requestAnimationFrame(maj)
    }
    demande()
    window.addEventListener('scroll', demande, { passive: true })
    window.addEventListener('resize', demande)
    v.addEventListener('loadedmetadata', demande)
    return () => {
      cancelAnimationFrame(image)
      window.removeEventListener('scroll', demande)
      window.removeEventListener('resize', demande)
      v.removeEventListener('loadedmetadata', demande)
    }
  }, [legendes])

  return (
    <section id={id} ref={section} className="relative" style={{ height: `${ecrans * 100}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#070b14]">
        <video
          ref={film}
          src={video}
          poster={affiche}
          muted
          playsInline
          preload="metadata"
          aria-label={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Vignettage : le texte reste lisible quelle que soit l'image */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(7,11,20,0.65)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#070b14]/85 to-transparent" />

        {legendes.map((l, i) => (
          <div
            key={i}
            ref={(n) => {
              textes.current[i] = n
            }}
            className={`pointer-events-none absolute inset-0 flex px-6 pb-20 md:px-14 md:pb-24 ${PLACEMENT[l.position ?? 'bas-gauche']}`}
            style={{ opacity: 0, transition: 'opacity 0.15s linear' }}
          >
            <div className="max-w-[40rem]">
              {l.surtitre && (
                <p className="font-mono text-[11px] font-medium tracking-[0.3em] text-[#d4a387] uppercase md:text-[12px]">
                  {l.surtitre}
                </p>
              )}
              {l.titre && (
                <h2 className="mt-3 text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.03em] text-[#eef3f9] uppercase drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
                  {l.titre}
                </h2>
              )}
              {l.texte && (
                <p className="mt-4 text-[17px] leading-relaxed text-[#d5deea] drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)] md:text-[20px]">
                  {l.texte}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
