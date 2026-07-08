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
    name: 'Chest Press (pecs)',
    muscles: ['pecs', 'triceps', 'épaules'],
    equipment: 'machine',
    imagePath: '/exercises/perso/chest-press-developpe-pecs.jpeg',
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
    name: 'Élévations latérales machine (Lateral Raise)',
    muscles: ['épaules'],
    equipment: 'machine',
    imagePath: '/exercises/elevations-laterales-machine.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'poulie-basse-croisee-pecs',
    name: 'Poulie basse croisée (pecs)',
    muscles: ['pecs'],
    equipment: 'poulie',
    imagePath: '/exercises/poulie-basse-croisee-pecs.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'oiseau-poulie-haute',
    name: 'Reverse Pec Deck (oiseau)',
    muscles: ['épaules arrière', 'dos'],
    equipment: 'machine',
    imagePath: '/exercises/oiseau-poulie-haute-machine.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'pushdown-corde',
    name: 'Pushdown poulie corde (triceps)',
    muscles: ['triceps'],
    equipment: 'poulie',
    imagePath: '/exercises/pushdown-corde.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'circuit-abdos',
    name: 'Circuit abdos',
    muscles: ['abdos'],
    equipment: 'poulie',
    imagePath: '/exercises/perso/crunch-poulie-abdos.jpeg',
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
    name: 'Reverse Pec Deck (rear delt)',
    muscles: ['épaules arrière'],
    equipment: 'machine',
    imagePath: '/exercises/rear-delt-machine.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'shrugs-halteres',
    name: 'Shrugs machine',
    muscles: ['trapèzes'],
    equipment: 'machine',
    imagePath: '/exercises/shrugs-halteres-machine.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'curl-incline',
    name: 'Curl biceps (machine)',
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
    name: 'Fentes bulgares Smith machine',
    muscles: ['quadriceps', 'fessiers'],
    equipment: 'machine',
    imagePath: '/exercises/fentes-bulgares-machine.jpg',
    machineEquivalent: null,
  },
  {
    slug: 'rdl',
    name: 'RDL Smith machine',
    muscles: ['ischios', 'fessiers', 'lombaires'],
    equipment: 'machine',
    imagePath: '/exercises/rdl-machine.jpg',
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
    name: 'Extension triceps machine',
    muscles: ['triceps'],
    equipment: 'machine',
    imagePath: '/exercises/barre-au-front-machine.jpg',
    machineEquivalent: null,
  },
]

// weekday : 0 = dimanche ... 6 = samedi (convention JS Date.getDay())
const program = {
  name: 'Arnold Split x PPL (4 séances)',
  days: [
    {
      weekday: 1,
      title: 'Pecs / Épaules / Triceps',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'developpe-couche-barre', sets: 4, repsMin: 6, repsMax: 8 }] },
        { type: 'single', items: [{ exerciseSlug: 'developpe-militaire-halteres', sets: 4, repsMin: 6, repsMax: 8 }] },
        { type: 'single', items: [{ exerciseSlug: 'pec-fly', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'elevations-laterales', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'poulie-basse-croisee-pecs', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'oiseau-poulie-haute', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'pushdown-corde', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'circuit-abdos', sets: 1 }] },
      ],
    },
    {
      weekday: 2,
      title: 'Dos / Biceps',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'tirage-poulie-haute-large', sets: 4, repsMin: 8, repsMax: 10 }] },
        { type: 'single', items: [{ exerciseSlug: 'tirage-horizontal-poulie-basse', sets: 4, repsMin: 8, repsMax: 8 }] },
        { type: 'single', items: [{ exerciseSlug: 'rear-delt', sets: 3, repsMin: 10, repsMax: 15 }] },
        { type: 'single', items: [{ exerciseSlug: 'shrugs-halteres', sets: 3, repsMin: 12, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'curl-incline', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'curl-marteau', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'single', items: [{ exerciseSlug: 'circuit-abdos', sets: 1 }] },
      ],
    },
    { weekday: 3, title: 'Run', type: 'run', blocks: [] },
    {
      weekday: 4,
      title: 'Jambes',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'presse-a-cuisses', sets: 4, repsMin: 10, repsMax: 10, note: 'Pieds placés hauts sur le plateau' }] },
        { type: 'single', items: [{ exerciseSlug: 'fentes-bulgares', sets: 3, repsMin: 8, repsMax: 10 }] },
        { type: 'single', items: [{ exerciseSlug: 'rdl', sets: 3, repsMin: 8, repsMax: 10 }] },
        { type: 'single', items: [{ exerciseSlug: 'leg-extension', sets: 3, repsMin: 10, repsMax: 12, note: 'Unilatéral' }] },
        { type: 'single', items: [{ exerciseSlug: 'leg-curl', sets: 3, repsMin: 10, repsMax: 12, note: 'Unilatéral' }] },
        { type: 'single', items: [{ exerciseSlug: 'mollets', sets: 3, repsMin: 20, repsMax: 20 }] },
        { type: 'single', items: [{ exerciseSlug: 'circuit-abdos', sets: 1 }] },
      ],
    },
    { weekday: 5, title: 'Repos', type: 'repos', blocks: [] },
    {
      weekday: 6,
      title: 'Épaules / Bras',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'developpe-militaire-halteres', sets: 4, repsMin: 6, repsMax: 8, note: 'Actuellement 10 kg' }] },
        { type: 'single', items: [{ exerciseSlug: 'elevations-laterales', sets: 3, repsMin: 10, repsMax: 15, note: '1 série lourde 10-12 + 1 série légère 12-15 · 10 kg → 6 kg' }] },
        { type: 'single', items: [{ exerciseSlug: 'rear-delt', sets: 3, repsMin: 10, repsMax: 15, note: '10 kg → 6 kg' }] },
        { type: 'single', items: [{ exerciseSlug: 'curl-incline', sets: 3, repsMin: 10, repsMax: 12, note: '6 kg — facile, tu peux monter' }] },
        { type: 'single', items: [{ exerciseSlug: 'barre-au-front', sets: 3, repsMin: 10, repsMax: 12, note: '6 kg — facile, tu peux monter' }] },
        { type: 'single', items: [{ exerciseSlug: 'curl-marteau', sets: 3, repsMin: 10, repsMax: 12, note: '10 kg — dans le dur (10/8/10)' }] },
        { type: 'single', items: [{ exerciseSlug: 'pushdown-corde', sets: 3, repsMin: 10, repsMax: 12, note: '10 kg — dans le dur' }] },
        { type: 'single', items: [{ exerciseSlug: 'shrugs-halteres', sets: 3, repsMin: 12, repsMax: 15, note: '10 kg' }] },
        { type: 'single', items: [{ exerciseSlug: 'circuit-abdos', sets: 1 }] },
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
