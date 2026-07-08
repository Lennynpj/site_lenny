// Seed : catalogue d'exercices (avec équivalences machines guidées Fitness Park)
// + programme Arnold Split x PPL de Lenny.
// Usage : npm run seed  (écrase exercises et programs, ne touche PAS aux séances enregistrées)
import 'dotenv/config'
import mongoose from 'mongoose'
import { Exercise } from '../src/models/Exercise.js'
import { Program } from '../src/models/Program.js'

const exercises = [
  {
    slug: 'developpe-couche-barre',
    name: 'Chest Press assis (pecs)',
    muscles: ['pecs', 'triceps', 'épaules'],
    equipment: 'machine',
    imagePath: '/exercises/perso/chest-press.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'developpe-pecs-plateaux',
    name: 'Développé pecs à plateaux',
    muscles: ['pecs', 'triceps'],
    equipment: 'machine',
    imagePath: '/exercises/perso/chest-press-developpe-pecs.jpeg',
    machineEquivalent: null,
  },
  {
    slug: 'tirage-horizontal-poulie',
    name: 'Tirage horizontal à la poulie',
    muscles: ['dos', 'biceps'],
    equipment: 'poulie',
    imagePath: '/exercises/tirage-horizontal-poulie-basse.jpg',
    setup: 'Poulie tout en BAS + poignée double (triangle) · assis face à la machine, pieds calés',
    machineEquivalent: null,
  },
  {
    slug: 'tirage-vertical-poitrine',
    name: 'Tirage vertical poitrine (poulie)',
    muscles: ['dos', 'biceps'],
    equipment: 'poulie',
    imagePath: '/exercises/tirage-poulie-haute-large.jpg',
    setup: 'Poulie tout en HAUT + barre large · assis, cuisses calées, tu tires la barre vers le haut de la poitrine',
    machineEquivalent: null,
  },
  {
    slug: 'curl-biceps-poulie',
    name: 'Curl biceps à la poulie basse',
    muscles: ['biceps'],
    equipment: 'poulie',
    imagePath: '/exercises/curl-biceps-poulie.jpg',
    setup: 'Poulie tout en BAS + barre droite ou EZ · debout face à la machine, coudes collés au buste',
    machineEquivalent: null,
  },
  {
    slug: 'developpe-militaire-halteres',
    name: 'Shoulder Press (épaules)',
    muscles: ['épaules', 'triceps'],
    equipment: 'machine',
    imagePath: '/exercises/perso/shoulder-press.jpeg',
    machineEquivalent: null,
  },
  {
    slug: 'pec-fly',
    name: 'Butterfly (pecs)',
    muscles: ['pecs'],
    equipment: 'machine',
    imagePath: '/exercises/perso/butterfly-pec-deck.jpeg',
    machineEquivalent: null,
  },
  {
    slug: 'elevations-laterales',
    name: 'Élévations latérales poulie basse',
    muscles: ['épaules'],
    equipment: 'poulie',
    imagePath: '/exercises/elevations-laterales-machine.jpg',
    setup: 'Poulie tout en BAS + poignée simple · de profil, un bras à la fois',
    machineEquivalent: null,
  },
  {
    slug: 'poulie-basse-croisee-pecs',
    name: 'Poulie basse croisée (pecs)',
    muscles: ['pecs'],
    equipment: 'poulie',
    imagePath: '/exercises/poulie-basse-croisee-pecs.jpg',
    setup: 'Les 2 poulies tout en BAS + poignées simples · au centre de la station, tu ramènes les mains devant toi en montant',
    machineEquivalent: null,
  },
  {
    slug: 'oiseau-poulie-haute',
    name: 'Oiseau poulie haute',
    muscles: ['épaules arrière', 'dos'],
    equipment: 'poulie',
    imagePath: '/exercises/oiseau-poulie-haute.jpg',
    setup: 'Les 2 poulies en HAUT, sans accessoire (câbles croisés en main) · tu ouvres les bras vers l’arrière',
    machineEquivalent: null,
  },
  {
    slug: 'pushdown-corde',
    name: 'Pushdown poulie corde (triceps)',
    muscles: ['triceps'],
    equipment: 'poulie',
    imagePath: '/exercises/pushdown-corde.jpg',
    setup: 'Poulie tout en HAUT + corde · face à la machine, coudes collés au buste, tu pousses vers le bas',
    machineEquivalent: null,
  },
  {
    slug: 'circuit-abdos',
    name: 'Crunch à la poulie (abdos)',
    muscles: ['abdos'],
    equipment: 'poulie',
    imagePath: '/exercises/perso/crunch-poulie-abdos.jpeg',
    setup: 'Poulie tout en HAUT + corde · à genoux face à la machine, tu enroules le buste vers le sol',
    machineEquivalent: null,
  },
  {
    slug: 'tirage-poulie-haute-large',
    name: 'Tirage vertical (dos)',
    muscles: ['dos', 'biceps'],
    equipment: 'machine',
    imagePath: '/exercises/perso/tirage-vertical-lat-pulldown.jpeg',
    machineEquivalent: null,
  },
  {
    slug: 'tirage-horizontal-poulie-basse',
    name: 'Tirage horizontal (dos)',
    muscles: ['dos', 'biceps'],
    equipment: 'machine',
    imagePath: '/exercises/perso/tirage-horizontal-rowing.jpeg',
    machineEquivalent: null,
  },
  {
    slug: 'rear-delt',
    name: 'Rear delt poulie haute (oiseau)',
    muscles: ['épaules arrière'],
    equipment: 'poulie',
    imagePath: '/exercises/oiseau-poulie-haute.jpg',
    setup: 'Les 2 poulies en HAUT, sans accessoire (câbles croisés en main) · tu ouvres les bras vers l’arrière',
    machineEquivalent: null,
  },
  {
    slug: 'shrugs-halteres',
    name: 'Shrugs poulie basse',
    muscles: ['trapèzes'],
    equipment: 'poulie',
    imagePath: '/exercises/shrugs-poulie.jpg',
    setup: 'Poulie tout en BAS + barre droite · debout, bras tendus, tu hausses les épaules',
    machineEquivalent: null,
  },
  {
    slug: 'curl-incline',
    name: 'Curl biceps pupitre',
    muscles: ['biceps'],
    equipment: 'machine',
    imagePath: '/exercises/perso/curl-pupitre-biceps.jpeg',
    machineEquivalent: null,
  },
  {
    slug: 'curl-marteau',
    name: 'Curl marteau corde (poulie basse)',
    muscles: ['biceps', 'avant-bras'],
    equipment: 'poulie',
    imagePath: '/exercises/curl-marteau-machine.jpg',
    setup: 'Poulie tout en BAS + corde · prise neutre (pouces vers le haut), coudes fixes',
    machineEquivalent: null,
  },
  {
    slug: 'presse-a-cuisses',
    name: 'Presse à cuisses (pieds hauts)',
    muscles: ['quadriceps', 'fessiers', 'ischios'],
    equipment: 'machine',
    imagePath: '/exercises/presse-a-cuisses.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'fentes-bulgares',
    name: 'Presse à cuisses unilatérale',
    muscles: ['quadriceps', 'fessiers'],
    equipment: 'machine',
    imagePath: '/exercises/presse-a-cuisses.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'rdl',
    name: 'Pull-through poulie basse',
    muscles: ['ischios', 'fessiers', 'lombaires'],
    equipment: 'poulie',
    imagePath: '/exercises/pull-through-poulie.jpg',
    setup: 'Poulie tout en BAS + corde · dos à la machine, corde entre les jambes, tu pousses les hanches vers l’avant',
    machineEquivalent: null,
  },
  {
    slug: 'leg-extension',
    name: 'Leg extension',
    muscles: ['quadriceps'],
    equipment: 'machine',
    imagePath: '/exercises/leg-extension.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'leg-curl',
    name: 'Leg curl',
    muscles: ['ischios'],
    equipment: 'machine',
    imagePath: '/exercises/leg-curl.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'mollets',
    name: 'Mollets machine ou presse',
    muscles: ['mollets'],
    equipment: 'machine',
    imagePath: '/exercises/mollets.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'barre-au-front',
    name: 'Extensions verticales à la poulie haute (triceps)',
    muscles: ['triceps'],
    equipment: 'poulie',
    imagePath: '/exercises/extension-triceps-corde.jpg',
    setup: 'Poulie tout en HAUT + corde · dos à la machine, coudes près de la tête, tu tends les bras vers l’avant',
    machineEquivalent: null,
  },
]

// weekday : 0 = dimanche ... 6 = samedi (convention JS Date.getDay())
const program = {
  name: 'Arnold Split x PPL (4 séances)',
  days: [
    {
      weekday: 1,
      title: 'Push · Pecs / Épaules',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'developpe-couche-barre', sets: 4, repsMin: 6, repsMax: 8, note: 'Lourd — c’est ton exo de force du jour' }] },
        { type: 'single', items: [{ exerciseSlug: 'developpe-militaire-halteres', sets: 4, repsMin: 6, repsMax: 8, note: 'Actuellement 10 kg' }] },
        { type: 'single', items: [{ exerciseSlug: 'pec-fly', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'barre-au-front', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'circuit-abdos', sets: 3, repsMin: 15, repsMax: 20 }] },
      ],
    },
    {
      weekday: 2,
      title: 'Pull · Dos / Biceps',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'tirage-poulie-haute-large', sets: 4, repsMin: 8, repsMax: 10 }] },
        { type: 'single', items: [{ exerciseSlug: 'tirage-horizontal-poulie-basse', sets: 4, repsMin: 8, repsMax: 8 }] },
        { type: 'single', items: [{ exerciseSlug: 'tirage-horizontal-poulie', sets: 3, repsMin: 10, repsMax: 12, note: 'À la cable station, buste droit' }] },
        { type: 'single', items: [{ exerciseSlug: 'curl-incline', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'curl-biceps-poulie', sets: 3, repsMin: 10, repsMax: 12, note: 'Tension continue, coudes fixes' }] },
        { type: 'single', items: [{ exerciseSlug: 'circuit-abdos', sets: 3, repsMin: 15, repsMax: 20 }] },
      ],
    },
    { weekday: 3, title: 'Run', type: 'run', blocks: [] },
    {
      weekday: 4,
      title: 'Push · Volume',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'developpe-pecs-plateaux', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'developpe-militaire-halteres', sets: 3, repsMin: 10, repsMax: 12, note: 'Plus léger que lundi, focus technique' }] },
        { type: 'single', items: [{ exerciseSlug: 'pec-fly', sets: 3, repsMin: 12, repsMax: 15 }] },
        { type: 'single', items: [{ exerciseSlug: 'barre-au-front', sets: 3, repsMin: 12, repsMax: 15, note: 'Plus léger que lundi' }] },
        { type: 'single', items: [{ exerciseSlug: 'circuit-abdos', sets: 3, repsMin: 15, repsMax: 20 }] },
      ],
    },
    { weekday: 5, title: 'Repos', type: 'repos', blocks: [] },
    {
      weekday: 6,
      title: 'Pull · Dos / Bras',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'tirage-horizontal-poulie-basse', sets: 4, repsMin: 8, repsMax: 8 }] },
        { type: 'single', items: [{ exerciseSlug: 'tirage-vertical-poitrine', sets: 3, repsMin: 10, repsMax: 12, note: 'Barre vers le haut de la poitrine, à la poulie' }] },
        { type: 'single', items: [{ exerciseSlug: 'curl-incline', sets: 4, repsMin: 8, repsMax: 10, note: '6 kg — facile, tu peux monter' }] },
        { type: 'single', items: [{ exerciseSlug: 'curl-biceps-poulie', sets: 3, repsMin: 10, repsMax: 12, note: 'Tension continue, coudes fixes' }] },
        { type: 'single', items: [{ exerciseSlug: 'circuit-abdos', sets: 3, repsMin: 15, repsMax: 20 }] },
      ],
    },
    { weekday: 0, title: 'Repos', type: 'repos', blocks: [] },
  ],
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/site_lenny'
await mongoose.connect(MONGODB_URI)
console.log(`Connecté à ${MONGODB_URI}`)

await Exercise.deleteMany({})
await Exercise.insertMany(exercises)
console.log(`${exercises.length} exercices insérés`)

await Program.deleteMany({})
await Program.create(program)
console.log(`Programme « ${program.name} » inséré (${program.days.length} jours)`)

// Cohérence : chaque slug du programme doit exister dans le catalogue
const known = new Set(exercises.map((e) => e.slug))
const missing = program.days
  .flatMap((d) => d.blocks.flatMap((b) => b.items.map((i) => i.exerciseSlug)))
  .filter((slug) => !known.has(slug))
if (missing.length) {
  console.error('ATTENTION — slugs inconnus dans le programme :', missing)
  process.exit(1)
}

await mongoose.disconnect()
console.log('Seed terminé.')
