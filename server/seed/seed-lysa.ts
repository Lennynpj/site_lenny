// Seed du côté Lysa : entraînement à la maison, 2 haltères de 10 kg, 3 séances.
// Les photos viennent de free-exercise-db (Unlicense, domaine public) et sont
// hébergées chez nous : aucun lien externe ne peut casser.
// Usage : npm run seed:lysa  (n'écrase QUE ce qui appartient à Lysa)
import 'dotenv/config'
import mongoose from 'mongoose'
import { Exercise } from '../src/models/Exercise.js'
import { Program } from '../src/models/Program.js'

const p = (slug: string) => [`/exercises/lysa/${slug}-0.jpg`, `/exercises/lysa/${slug}-1.jpg`]

const exercises = [
  // ── Jour 1 · quadriceps ────────────────────────────────────────
  {
    slug: 'lysa-goblet-squat',
    name: 'Goblet squat',
    muscles: ['cuisses', 'fessiers'],
    equipment: 'haltères',
    pattern: 'squat',
    photos: p('goblet-squat'),
    videoId: '0sXGh-v7RZ0',
    howTo: [
      'Haltère tenu contre la poitrine, coudes serrés.',
      'Descends lentement, en comptant 3 secondes.',
      'Genoux dans l’axe des pieds, talons collés au sol.',
    ],
  },
  {
    slug: 'lysa-fentes-bulgares',
    name: 'Fentes bulgares',
    muscles: ['cuisses', 'fessiers'],
    equipment: 'haltères',
    pattern: 'fente',
    unit: 'parJambe',
    photos: p('fentes-bulgares'),
    videoId: 'r_-HNEXkW00',
    setup: 'Pied arrière posé sur une chaise, le canapé ou le bord du lit',
    howTo: [
      'Pied arrière posé derrière toi, sur une chaise ou le canapé.',
      'Fais un grand pas en avant avant de descendre.',
      'Descends bien droite : tout le poids sur la jambe avant.',
    ],
  },
  {
    slug: 'lysa-fentes-arriere',
    name: 'Fentes arrière',
    muscles: ['cuisses', 'fessiers'],
    equipment: 'haltères',
    pattern: 'fente',
    unit: 'parJambe',
    photos: p('fentes-arriere'),
    videoId: '5p8_wmN5qGI',
    howTo: [
      'Un haltère dans chaque main, bras le long du corps.',
      'Grand pas en arrière, genou arrière vers le sol sans le toucher.',
      'Pousse sur le talon avant pour remonter.',
    ],
  },
  {
    slug: 'lysa-squat-talons',
    name: 'Squat talons surélevés',
    muscles: ['cuisses'],
    equipment: 'haltères',
    pattern: 'squat',
    photos: p('squat-talons'),
    videoId: 'uFPPbFNiifc',
    setup: 'Talons posés sur un livre épais ou une petite cale (2 à 4 cm)',
    howTo: [
      'Talons sur un livre épais : ça envoie le travail sur les cuisses.',
      'Haltère contre la poitrine, buste bien droit.',
      'Ça brûle sur la fin — c’est exactement le but.',
    ],
  },

  // ── Jour 2 · haut du corps ─────────────────────────────────────
  {
    slug: 'lysa-rowing-penche',
    name: 'Rowing buste penché',
    muscles: ['dos', 'biceps'],
    equipment: 'haltères',
    pattern: 'tirage',
    photos: p('rowing-penche'),
    videoId: 'qdoquGndifw',
    howTo: [
      'Buste penché en avant, dos plat — jamais arrondi.',
      'Tire les coudes vers l’arrière en serrant les omoplates.',
      'Redescends lentement, sans laisser tomber.',
    ],
  },
  {
    slug: 'lysa-developpe-sol',
    name: 'Développé couché au sol',
    muscles: ['pecs', 'triceps', 'épaules'],
    equipment: 'haltères',
    pattern: 'pousse',
    photos: p('developpe-sol'),
    videoId: 'n8L1mlr-Dik',
    howTo: [
      'Allongée au sol, genoux pliés, pieds à plat.',
      'Descends jusqu’à ce que les coudes touchent le sol.',
      'Le sol bloque la descente : c’est plus sûr pour les épaules.',
    ],
  },
  {
    slug: 'lysa-rowing-un-bras',
    name: 'Rowing un bras',
    muscles: ['dos', 'biceps'],
    equipment: 'haltères',
    pattern: 'tirage',
    unit: 'parBras',
    photos: p('rowing-un-bras'),
    videoId: 'I6jgqLon-ng',
    setup: 'Un genou et une main en appui sur une chaise ou le canapé',
    howTo: [
      'Un genou et une main en appui sur le canapé.',
      'Dos plat comme une table, tire le coude vers la hanche.',
      'Termine tout un bras, puis passe à l’autre.',
    ],
  },
  {
    slug: 'lysa-developpe-militaire',
    name: 'Développé militaire',
    muscles: ['épaules', 'triceps'],
    equipment: 'haltères',
    pattern: 'epaules',
    photos: p('developpe-militaire'),
    videoId: '0VRD2xGvTrE',
    howTo: [
      'Debout ou assise, ventre gainé, fesses serrées.',
      'Pousse au-dessus de la tête sans cambrer le bas du dos.',
      'Trop lourd ? Fais un bras à la fois, c’est fait pour.',
    ],
  },
  {
    slug: 'lysa-pompes',
    name: 'Pompes',
    muscles: ['pecs', 'triceps', 'épaules'],
    equipment: 'poids du corps',
    pattern: 'pompe',
    unit: 'max',
    photos: p('pompes'),
    videoId: 'SWUw2epT8P4',
    howTo: [
      'Mains un peu plus larges que les épaules.',
      'Corps en planche : fesses serrées, pas de creux dans le dos.',
      'Trop dur ? Pose les genoux — ça reste une vraie pompe.',
    ],
  },

  // ── Jour 3 · ischios et fessiers ───────────────────────────────
  {
    slug: 'lysa-rdl',
    name: 'Soulevé de terre roumain',
    muscles: ['ischios', 'fessiers', 'dos'],
    equipment: 'haltères',
    pattern: 'charniere',
    photos: p('rdl'),
    videoId: 'Iy3J5_qzUdo',
    howTo: [
      'Haltères devant les cuisses, genoux à peine fléchis.',
      'Pousse les fesses loin en arrière, dos bien plat.',
      'Tu dois sentir tirer derrière les cuisses, pas dans le bas du dos.',
    ],
  },
  {
    slug: 'lysa-hip-thrust',
    name: 'Hip thrust sur le canapé',
    muscles: ['fessiers'],
    equipment: 'haltères',
    pattern: 'hipthrust',
    photos: p('hip-thrust'),
    videoId: 'MQ_pHfRk8xI',
    setup: 'Le canapé remplace le banc · haut du dos sur le bord, pieds à plat, écartés comme les hanches',
    howTo: [
      'Assise au sol, cale le haut du dos sur le bord du canapé.',
      'Haltère posé sur le haut des hanches, tenu à deux mains.',
      'Monte en serrant les fesses, marque 1 seconde en haut.',
    ],
  },
  {
    slug: 'lysa-rdl-une-jambe',
    name: 'Soulevé de terre une jambe',
    muscles: ['ischios', 'fessiers'],
    equipment: 'haltères',
    pattern: 'charniere',
    unit: 'parJambe',
    photos: p('rdl-une-jambe'),
    videoId: 'A6MYR61mLTo',
    howTo: [
      'En appui sur une jambe, l’autre part droite derrière toi.',
      'Descends l’haltère le long de la jambe d’appui.',
      'Va lentement : l’équilibre fait partie de l’exercice.',
    ],
  },
  {
    slug: 'lysa-fentes-longues',
    name: 'Fentes arrière longues',
    muscles: ['fessiers', 'ischios'],
    equipment: 'haltères',
    pattern: 'fente',
    unit: 'parJambe',
    photos: p('fentes-arriere'),
    videoId: '5p8_wmN5qGI',
    howTo: [
      'Comme au Jour 1, mais avec un pas bien plus grand.',
      'Plus le pas est long, plus ce sont les fessiers qui travaillent.',
      'Penche légèrement le buste en avant.',
    ],
  },
  {
    slug: 'lysa-squat-sumo',
    name: 'Squat sumo',
    muscles: ['fessiers', 'intérieur des cuisses'],
    equipment: 'haltères',
    pattern: 'squat',
    photos: p('squat-sumo'),
    videoId: 'v8CD8ZGVlGA',
    howTo: [
      'Pieds bien plus larges que les épaules, pointes ouvertes.',
      'Un haltère tenu à deux mains entre les jambes.',
      'Descends droite, en poussant les genoux vers l’extérieur.',
    ],
  },
  {
    slug: 'lysa-leg-curl-glisse',
    name: 'Leg curl glissé au sol',
    muscles: ['ischios', 'fessiers'],
    equipment: 'poids du corps',
    pattern: 'legcurl',
    // Pas de photo : toutes les images libres de cet exercice montrent un
    // ballon de gym. Le schéma dessiné fait le travail.
    photos: [],
    videoId: 'AJwEyyvcjJg',
    setup: 'Chaussettes ou petite serviette sous les talons · sol lisse (parquet, carrelage)',
    howTo: [
      'Allongée sur le dos, talons sur des chaussettes ou une serviette.',
      'Monte les hanches, puis fais glisser les talons vers toi.',
      'Il faut un sol lisse, sinon ça ne glisse pas.',
    ],
  },

  // ── Abdos ──────────────────────────────────────────────────────
  {
    slug: 'lysa-gainage',
    name: 'Gainage',
    muscles: ['abdos'],
    equipment: 'poids du corps',
    pattern: 'gainage',
    unit: 'secondes',
    photos: p('gainage'),
    videoId: 'hoPwUu8vvvw',
    howTo: [
      'En appui sur les avant-bras, corps bien droit.',
      'Fesses serrées, ventre rentré, aucun creux dans le dos.',
      'Respire normalement, ne bloque pas.',
    ],
  },
  {
    slug: 'lysa-russian-twist',
    name: 'Russian twist',
    muscles: ['abdos', 'obliques'],
    equipment: 'haltères',
    pattern: 'rotation',
    unit: 'parCote',
    photos: p('russian-twist'),
    videoId: 'LSALdQZ_RMY',
    howTo: [
      'Assise, buste légèrement en arrière, pieds décollés si tu peux.',
      'Fais passer l’haltère d’un côté à l’autre.',
      'Ce sont les épaules qui tournent, pas seulement les bras.',
    ],
  },
  {
    slug: 'lysa-mountain-climbers',
    name: 'Mountain climbers',
    muscles: ['abdos'],
    equipment: 'poids du corps',
    pattern: 'climbers',
    unit: 'parCote',
    // Photo écartée : prise de trois quarts, on ne lit pas le mouvement.
    photos: [],
    videoId: 'gXv9T1flQhU',
    howTo: [
      'En position de pompe, mains bien sous les épaules.',
      'Ramène un genou vers la poitrine, puis l’autre.',
      'Garde les hanches basses, ne monte pas les fesses.',
    ],
  },
  {
    slug: 'lysa-crunch',
    name: 'Crunch',
    muscles: ['abdos'],
    equipment: 'poids du corps',
    pattern: 'crunch',
    photos: p('crunch'),
    videoId: 'zUk1BiL6Ajc',
    howTo: [
      'Allongée, genoux pliés, mains sur les tempes.',
      'Décolle seulement les épaules, pas tout le dos.',
      'Souffle en montant.',
    ],
  },
]

// weekday : 0 = dimanche ... 6 = samedi. Lundi / mercredi / vendredi :
// les deux jours de jambes ne se suivent jamais.
const program = {
  owner: 'lysa' as const,
  name: 'À la maison · 3 séances',
  days: [
    {
      weekday: 1,
      title: 'Jambes · cuisses',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'lysa-goblet-squat', sets: 4, repsMin: 12, repsMax: 15, note: 'Haltère de 10 kg, descente lente' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-fentes-bulgares', sets: 3, repsMin: 10, repsMax: 10, note: 'Un haltère dans chaque main' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-fentes-arriere', sets: 3, repsMin: 10, repsMax: 10, note: '2 haltères' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-squat-talons', sets: 3, repsMin: 15, repsMax: 20, note: 'Haltère contre la poitrine' }] },
        {
          type: 'circuit',
          items: [
            { exerciseSlug: 'lysa-gainage', sets: 3, repsMin: 30, repsMax: 45 },
            { exerciseSlug: 'lysa-russian-twist', sets: 3, repsMin: 10, repsMax: 10, note: 'Avec un haltère' },
          ],
        },
      ],
    },
    { weekday: 2, title: 'Repos', type: 'repos', blocks: [] },
    {
      weekday: 3,
      title: 'Haut du corps',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'lysa-rowing-penche', sets: 4, repsMin: 10, repsMax: 12, note: '2 haltères' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-developpe-sol', sets: 4, repsMin: 10, repsMax: 15 }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-rowing-un-bras', sets: 3, repsMin: 12, repsMax: 12, note: 'Appui sur une chaise ou le canapé' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-developpe-militaire', sets: 3, repsMin: 8, repsMax: 12, note: 'Si 10 kg est trop lourd, un bras à la fois' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-pompes', sets: 3, repsMin: 0, repsMax: 0, note: 'Le maximum, en restant propre' }] },
        {
          type: 'circuit',
          items: [
            { exerciseSlug: 'lysa-mountain-climbers', sets: 3, repsMin: 20, repsMax: 20 },
            { exerciseSlug: 'lysa-crunch', sets: 3, repsMin: 15, repsMax: 20 },
          ],
        },
      ],
    },
    { weekday: 4, title: 'Repos', type: 'repos', blocks: [] },
    {
      weekday: 5,
      title: 'Jambes · fessiers',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'lysa-rdl', sets: 4, repsMin: 12, repsMax: 15, note: '2 haltères' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-hip-thrust', sets: 4, repsMin: 12, repsMax: 15, note: 'Sur le canapé, 1 seconde de pause en haut' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-rdl-une-jambe', sets: 3, repsMin: 10, repsMax: 10, note: '1 ou 2 haltères' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-fentes-longues', sets: 3, repsMin: 12, repsMax: 12, note: 'Grand pas : plus de fessiers' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-squat-sumo', sets: 3, repsMin: 15, repsMax: 15, note: '2 haltères' }] },
        { type: 'single', items: [{ exerciseSlug: 'lysa-leg-curl-glisse', sets: 3, repsMin: 10, repsMax: 15, note: 'Chaussettes ou serviette sous les talons' }] },
      ],
    },
    { weekday: 6, title: 'Repos', type: 'repos', blocks: [] },
    { weekday: 0, title: 'Repos', type: 'repos', blocks: [] },
  ],
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/site_lenny'
await mongoose.connect(MONGODB_URI)
console.log(`Connecté à ${MONGODB_URI}`)

// On ne touche qu'à ce qui est à Lysa : le catalogue de Lenny reste intact.
await Exercise.deleteMany({ slug: /^lysa-/ })
await Exercise.insertMany(exercises)
console.log(`${exercises.length} exercices insérés pour Lysa`)

await Program.deleteMany({ owner: 'lysa' })
await Program.create(program)
console.log(`Programme « ${program.name} » inséré`)

const known = new Set(exercises.map((e) => e.slug))
const missing = program.days
  .flatMap((d) => d.blocks.flatMap((b) => b.items.map((i) => i.exerciseSlug)))
  .filter((slug) => !known.has(slug))
if (missing.length) {
  console.error('ATTENTION — slugs inconnus dans le programme :', missing)
  process.exit(1)
}

await mongoose.disconnect()
console.log('Seed Lysa terminé.')
