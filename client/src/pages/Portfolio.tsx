import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowDown, ArrowUpRight, GithubLogo, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import Chapitre from './portfolio/Chapitre'
import type { Legende } from './portfolio/Chapitre'

/* Site vitrine en forme de court-métrage.
   On fait défiler et on suit le trajet : Livry-Gargan, le RER B de nuit,
   Saint-Germain, le métro, La Défense, puis ce qui fait respirer — la
   montagne, Shibuya. Chaque chapitre est une vidéo pilotée par le défilement
   (voir Chapitre.tsx). Le portfolio classique — projets, compétences,
   contact — arrive après le générique.
   Les légendes sont définies ici, hors des composants : un tableau recréé à
   chaque rendu relancerait les écouteurs de défilement. */

// Les médias vivent dans /film/ et non /portfolio/ : un dossier du même nom
// que la route ferait rediriger la page vers le dossier (301 de nginx).
const M = (n: string) => `/film/${n}`

const CHAPITRES: { id: string; fichier: string; alt: string; ecrans: number; legendes: Legende[] }[] = [
  {
    id: 'livry',
    fichier: 'livry',
    alt: 'Une rue pavillonnaire de Livry-Gargan au crépuscule, le panneau de la ville',
    ecrans: 3.2,
    legendes: [
      { de: 0.02, a: 0.42, surtitre: '48.93° N · 2.53° E', titre: 'Livry-Gargan', texte: 'Seine-Saint-Denis. C’est là que tout commence.' },
      { de: 0.5, a: 0.95, surtitre: 'Chapitre 01', texte: 'Une rue de pavillons, un réverbère qui s’allume, et l’envie d’aller voir ce qu’il y a au bout de la ligne.', position: 'haut-gauche' },
    ],
  },
  {
    id: 'rer',
    fichier: 'rer',
    alt: 'Dans un wagon du RER B la nuit, les lumières de la ville défilent',
    ecrans: 2.4,
    legendes: [
      { de: 0.1, a: 0.85, surtitre: 'RER B · 23 h 40', titre: 'Entre deux villes', texte: 'Une heure de trajet. Les écouteurs, la vitre, et les idées qui s’assemblent.', position: 'bas-droite' },
    ],
  },
  {
    id: 'saint-germain',
    fichier: 'flore',
    alt: 'Saint-Germain-des-Prés le matin, la terrasse du Café de Flore',
    ecrans: 3.2,
    legendes: [
      { de: 0.02, a: 0.45, surtitre: '48.85° N · 2.33° E', titre: 'Saint-Germain', texte: 'Université Paris Cité.' },
      { de: 0.52, a: 0.95, surtitre: 'Chapitre 02', texte: 'Master 2 MIAGE. Le café du matin devant le Flore, avant les cours et le mémoire sur les Small Language Models.', position: 'haut-gauche' },
    ],
  },
  {
    id: 'metro',
    fichier: 'metro',
    alt: 'Dans le métro parisien à l’heure de pointe',
    ecrans: 2.2,
    legendes: [
      { de: 0.12, a: 0.85, surtitre: 'Ligne 1 · direction La Défense', titre: 'Correspondance', position: 'centre' },
    ],
  },
  {
    id: 'defense',
    fichier: 'defense',
    alt: 'L’esplanade de La Défense le matin, la Grande Arche au loin',
    ecrans: 3.2,
    legendes: [
      { de: 0.02, a: 0.45, surtitre: '48.89° N · 2.24° E', titre: 'La Défense', texte: 'L’alternance.' },
      { de: 0.52, a: 0.95, surtitre: 'Chapitre 03', texte: 'Les données, le pricing, et la satisfaction d’un modèle qui tombe juste.', position: 'haut-gauche' },
    ],
  },
  {
    id: 'montagne',
    fichier: 'montagne',
    alt: 'En haute montagne, sur une arête enneigée au-dessus d’une mer de nuages',
    ecrans: 3.2,
    legendes: [
      { de: 0.02, a: 0.45, surtitre: 'Haute altitude', titre: 'La montagne', texte: 'Ce qui me fait tenir.' },
      { de: 0.52, a: 0.95, surtitre: 'Chapitre 04', texte: 'Là-haut, une seule règle : un pas après l’autre. Ça marche aussi pour le code.', position: 'haut-gauche' },
    ],
  },
  {
    id: 'shibuya',
    fichier: 'shibuya',
    alt: 'Le carrefour de Shibuya à Tokyo, la nuit, sous la pluie et les néons',
    ecrans: 3.2,
    legendes: [
      { de: 0.02, a: 0.45, surtitre: '35.66° N · 139.70° E', titre: 'Shibuya', texte: 'Et l’envie d’aller voir plus loin.' },
      { de: 0.55, a: 0.97, surtitre: 'Fin du premier acte', titre: 'La suite ?', texte: 'Ce que je construis, juste en dessous.', position: 'centre' },
    ],
  },
]

const PROJETS = [
  {
    nom: 'Muscu',
    lien: '/muscu',
    resume:
      'Suivi de musculation : le programme de la semaine, la saisie des séries, un minuteur de repos et les courbes de progression, avec les photos des machines de ma propre salle.',
    pile: ['React', 'TypeScript', 'Express', 'MongoDB', 'Recharts'],
  },
  {
    nom: 'Comptes',
    lien: '/comptes',
    prive: true,
    resume:
      'Une application de budget pensée pour quelqu’un qui n’aime pas les écrans : assistant de première utilisation, pavé numérique sans clavier système, connexion par Face ID, profils isolés côté serveur.',
    pile: ['React', 'WebAuthn', 'Express', 'Mongoose', 'Accessibilité'],
  },
  {
    nom: 'Lysa',
    lien: '/lysa',
    resume:
      'Un coach d’entraînement à la maison : un exercice à la fois en plein écran, des séries validées en un geste, le repos qui prend l’écran, une démonstration filmée par mouvement.',
    pile: ['React', 'Tailwind', 'UX mobile', 'API REST'],
  },
]

const COMPETENCES = [
  { titre: 'Interfaces', items: ['React', 'TypeScript', 'Tailwind CSS', 'Accessibilité', 'Applications installables'] },
  { titre: 'Serveur', items: ['Node.js · Express', 'MongoDB', 'API REST', 'Authentification WebAuthn'] },
  { titre: 'Données & IA', items: ['Analyse de données', 'Pricing', 'Small Language Models'] },
  { titre: 'Mise en ligne', items: ['Docker Compose', 'Caddy · nginx', 'VPS Linux', 'HTTPS'] },
]

/** Fait apparaître un bloc quand il entre à l'écran — une seule fois. */
function Apparait({ children, delai = 0, className = '' }: { children: ReactNode; delai?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`pf-apparait ${visible ? 'pf-visible' : ''} ${className}`} style={{ transitionDelay: `${delai}ms` }}>
      {children}
    </div>
  )
}

function Etiquette({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[11px] font-medium tracking-[0.3em] text-[#d4a387] uppercase">{children}</p>
}

/** La musique ne démarre jamais seule : les navigateurs l'interdisent, et
    une page qui parle sans prévenir fait fuir. Un bouton, un fondu. */
function BoutonSon() {
  const audio = useRef<HTMLAudioElement>(null)
  const [actif, setActif] = useState(false)

  function basculer() {
    const a = audio.current
    if (!a) return
    if (actif) {
      a.pause()
      setActif(false)
      return
    }
    a.volume = 0
    a.play()
      .then(() => {
        setActif(true)
        const debut = performance.now()
        const monter = (t: number) => {
          const v = Math.min(0.6, ((t - debut) / 2500) * 0.6)
          a.volume = v
          if (v < 0.6 && !a.paused) requestAnimationFrame(monter)
        }
        requestAnimationFrame(monter)
      })
      .catch(() => setActif(false))
  }

  return (
    <>
      <audio ref={audio} src={M('musique.mp3')} loop preload="none" />
      <button
        onClick={basculer}
        aria-pressed={actif}
        aria-label={actif ? 'Couper la musique' : 'Lancer la musique'}
        className="fixed right-5 bottom-5 z-50 flex h-12 items-center gap-2 rounded-full border border-white/20 bg-[#0b1220]/60 px-4 text-[13px] font-semibold tracking-[0.12em] text-[#e6edf5] uppercase backdrop-blur-md transition-colors hover:bg-[#0b1220]/80"
      >
        {actif ? <SpeakerHigh size={18} weight="fill" /> : <SpeakerSlash size={18} />}
        {actif ? 'Son' : 'Son coupé'}
      </button>
    </>
  )
}

export default function Portfolio() {
  return (
    <div className="pf min-h-dvh bg-[#070b14] text-[#e6edf5] selection:bg-[#d4a387]/30">
      <BoutonSon />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <nav className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <a href="#haut" className="text-[15px] font-extrabold tracking-[0.18em] uppercase drop-shadow">
            Lenny<span className="text-[#d4a387]">.</span>
          </a>
          <a
            href="#projets"
            className="rounded-full border border-white/20 bg-[#0b1220]/40 px-4 py-2 text-[13px] font-semibold backdrop-blur-md transition-colors hover:bg-[#0b1220]/70"
          >
            Aller aux projets
          </a>
        </nav>
      </header>

      {/* ── Générique d'ouverture ─────────────────────────────────── */}
      <section id="haut" className="relative flex min-h-[100svh] items-end overflow-hidden">
        <img src={M('livry.jpg')} alt="" aria-hidden="true" className="pf-zoom absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/70 via-[#070b14]/30 to-[#070b14]" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
          <Apparait>
            <Etiquette>Un film de · Lenny Napieraj</Etiquette>
          </Apparait>
          <Apparait delai={140}>
            <h1 className="mt-4 text-[clamp(3rem,11vw,8.5rem)] leading-[0.88] font-extrabold tracking-[-0.03em] uppercase">
              D’où
              <br />
              <span className="text-[#d4a387]">je viens</span>
            </h1>
          </Apparait>
          <Apparait delai={280}>
            <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-[#c3cfdd] md:text-[19px]">
              Étudiant en M2 MIAGE et développeur. Faites défiler : le trajet commence en banlieue.
            </p>
          </Apparait>
          <Apparait delai={420}>
            <p className="mt-10 flex items-center gap-2 font-mono text-[12px] tracking-[0.2em] text-[#8fa0b5] uppercase">
              <ArrowDown size={16} className="pf-rebond" /> Défiler pour lancer le film
            </p>
          </Apparait>
        </div>
      </section>

      {/* ── Le film ───────────────────────────────────────────────── */}
      {CHAPITRES.map((c) => (
        <Chapitre
          key={c.id}
          id={c.id}
          video={M(`${c.fichier}.mp4`)}
          affiche={M(`${c.fichier}.jpg`)}
          ecrans={c.ecrans}
          legendes={c.legendes}
          alt={c.alt}
        />
      ))}

      {/* ── Projets ───────────────────────────────────────────────── */}
      <section id="projets" className="relative bg-[#0b1220]">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
          <Apparait>
            <Etiquette>Après le générique</Etiquette>
            <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.75rem)] leading-[0.95] font-extrabold tracking-[-0.02em] uppercase">
              Ce que j’ai construit
            </h2>
            <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-[#b6c3d3]">
              Trois applications qui tournent sur ce site, conçues, développées et mises en ligne de bout
              en bout sur mon propre serveur.
            </p>
          </Apparait>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PROJETS.map((p, i) => (
              <Apparait key={p.nom} delai={i * 120} className="h-full">
                <a
                  href={p.lien}
                  className="group flex h-full flex-col rounded-[20px] border border-white/10 bg-[#121b2b] p-6 transition-colors duration-300 hover:border-[#d4a387]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[12px] text-[#8fa0b5]">0{i + 1}</span>
                    <ArrowUpRight
                      size={20}
                      className="text-[#8fa0b5] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#d4a387]"
                    />
                  </div>
                  <h3 className="mt-6 text-[28px] font-extrabold tracking-[-0.01em] uppercase">{p.nom}</h3>
                  {p.prive && (
                    <span className="mt-1 font-mono text-[11px] tracking-[0.15em] text-[#d4a387] uppercase">Accès privé</span>
                  )}
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#b6c3d3]">{p.resume}</p>
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {p.pile.map((t) => (
                      <li key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-[12px] text-[#c3cfdd]">
                        {t}
                      </li>
                    ))}
                  </ul>
                </a>
              </Apparait>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compétences ───────────────────────────────────────────── */}
      <section id="competences" className="border-t border-white/5 bg-[#0b1220]">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
          <Apparait>
            <Etiquette>Le matériel dans le sac</Etiquette>
            <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.75rem)] leading-[0.95] font-extrabold tracking-[-0.02em] uppercase">
              Compétences
            </h2>
          </Apparait>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {COMPETENCES.map((c, i) => (
              <Apparait key={c.titre} delai={i * 100}>
                <h3 className="border-t border-[#d4a387]/60 pt-4 text-[15px] font-bold tracking-[0.12em] uppercase">{c.titre}</h3>
                <ul className="mt-4 space-y-2.5">
                  {c.items.map((it) => (
                    <li key={it} className="text-[16px] text-[#c3cfdd]">
                      {it}
                    </li>
                  ))}
                </ul>
              </Apparait>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────── */}
      <section id="contact" className="relative flex min-h-[80svh] items-end overflow-hidden">
        <img src={M('contact.jpg')} alt="Une tente éclairée de l’intérieur sur une arête, la nuit" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220] via-transparent to-[#070b14]/90" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-24 md:px-8 md:pb-28">
          <Apparait>
            <Etiquette>Contact</Etiquette>
            <h2 className="mt-4 text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.92] font-extrabold tracking-[-0.02em] uppercase">
              On écrit
              <br />
              <span className="text-[#d4a387]">la suite</span> ensemble&nbsp;?
            </h2>
          </Apparait>
          <Apparait delai={150}>
            <a
              href="https://github.com/Lennynpj"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#e6edf5] px-6 text-[15px] font-semibold text-[#0b1220] transition-transform active:scale-[0.98]"
            >
              <GithubLogo size={18} weight="fill" /> GitHub
            </a>
          </Apparait>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#070b14]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 pr-36 text-[13px] text-[#8fa0b5] md:flex-row md:justify-between md:px-8 md:pr-40">
          <span>© {new Date().getFullYear()} Lenny Napieraj</span>
          <span>Images, vidéos et musique générées pour ce site.</span>
        </div>
      </footer>
    </div>
  )
}
