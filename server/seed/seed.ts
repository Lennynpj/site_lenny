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
    name: 'Développé couché barre',
    muscles: ['pecs', 'triceps', 'épaules'],
    equipment: 'barre',
    imagePath: '/exercises/developpe-couche-barre.jpg',
    machineEquivalent: {
      name: 'Chest Press Technogym (charge à plateaux)',
      howToFind:
        'Machine assise jaune/noire avec deux bras à plateaux, marquée « Chest Press ». Pousse les poignées devant toi, dos plaqué au dossier. (Photo : ta salle)',
      imagePath: '/exercises/perso/chest-press.jpg',
    },
  },
  {
    slug: 'developpe-militaire-halteres',
    name: 'Développé militaire haltères assis',
    muscles: ['épaules', 'triceps'],
    equipment: 'haltères',
    imagePath: '/exercises/developpe-militaire-halteres.jpg',
    machineEquivalent: {
      name: 'Shoulder Press Technogym (charge à plateaux)',
      howToFind:
        'Machine assise avec bras à plateaux au niveau des oreilles, marquée « Shoulder Press ». Pousse vers le haut, sans verrouiller les coudes. (Photo : ta salle)',
      imagePath: '/exercises/perso/shoulder-press.jpeg',
    },
  },
  {
    slug: 'pec-fly',
    name: 'Pec fly (Butterfly)',
    muscles: ['pecs'],
    equipment: 'machine',
    imagePath: '/exercises/pec-fly.jpg',
    machineEquivalent: {
      name: 'Butterfly Technogym',
      howToFind:
        'Machine assise à charge guidée marquée « Butterfly » : bras écartés sur les poignées, tu les ramènes devant toi. (Photo : ta salle)',
      imagePath: '/exercises/perso/butterfly.jpeg',
    },
  },
  {
    slug: 'elevations-laterales',
    name: 'Élévations latérales',
    muscles: ['épaules'],
    equipment: 'haltères',
    imagePath: '/exercises/elevations-laterales.jpg',
    machineEquivalent: {
      name: 'Machine élévations latérales (Lateral Raise)',
      howToFind:
        'Machine assise avec coussinets contre les avant-bras/coudes, marquée « Lateral Raise ». Sinon : élévations à la poulie basse, un bras à la fois.',
      imagePath: '/exercises/elevations-laterales-machine.jpg',
    },
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
    name: 'Oiseau poulie haute',
    muscles: ['épaules arrière', 'dos'],
    equipment: 'poulie',
    imagePath: '/exercises/oiseau-poulie-haute.jpg',
    machineEquivalent: {
      name: 'Reverse Pec Deck (pec deck inversé)',
      howToFind:
        'La machine Pec Deck utilisée à l’envers : assis face au dossier, poignées devant toi, tu ouvres les bras vers l’arrière.',
      imagePath: '/exercises/oiseau-poulie-haute-machine.jpg',
    },
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
    equipment: 'poids du corps',
    imagePath: '/exercises/perso/abdos.jpeg',
    machineEquivalent: {
      name: 'Machine à crunch (Ab Crunch)',
      howToFind:
        'Machine assise marquée « Abdominal » : tu tires les poignées vers le bas en enroulant le buste. Alternative guidée au circuit au sol.',
      imagePath: '/exercises/circuit-abdos-machine.jpg',
    },
  },
  {
    slug: 'tirage-poulie-haute-large',
    name: 'Tirage poulie haute prise large',
    muscles: ['dos', 'biceps'],
    equipment: 'poulie',
    imagePath: '/exercises/tirage-poulie-haute-large.jpg',
    machineEquivalent: {
      name: 'Tirage vertical à plateaux (Pulldown Technogym)',
      howToFind:
        'Machine jaune/noire à plateaux marquée « Pulldown » : assis, cuisses calées, tu tires les poignées vers le bas. (Photo : ta salle)',
      imagePath: '/exercises/perso/tirage-vertical.jpeg',
    },
  },
  {
    slug: 'tirage-horizontal-poulie-basse',
    name: 'Tirage horizontal poulie basse prise large',
    muscles: ['dos', 'biceps'],
    equipment: 'poulie',
    imagePath: '/exercises/tirage-horizontal-poulie-basse.jpg',
    machineEquivalent: {
      name: 'Low Row Technogym (tirage horizontal à plateaux)',
      howToFind:
        'Machine jaune/noire à plateaux marquée « Low Row » : assis avec appui poitrine, tu tires les poignées vers toi. (Photo : ta salle)',
      imagePath: '/exercises/perso/tirage-horizontal.jpeg',
    },
  },
  {
    slug: 'rear-delt',
    name: 'Rear delt (oiseau)',
    muscles: ['épaules arrière'],
    equipment: 'haltères',
    imagePath: '/exercises/rear-delt.jpg',
    machineEquivalent: {
      name: 'Reverse Pec Deck (pec deck inversé)',
      howToFind:
        'Machine Pec Deck à l’envers : assis face au dossier, tu ouvres les bras vers l’arrière. Réglage des poignées en position « rear delt ».',
      imagePath: '/exercises/rear-delt-machine.jpg',
    },
  },
  {
    slug: 'shrugs-halteres',
    name: 'Shrugs haltères',
    muscles: ['trapèzes'],
    equipment: 'haltères',
    imagePath: '/exercises/shrugs-halteres.jpg',
    machineEquivalent: {
      name: 'Machine à shrugs (Leverage Shrug) ou Smith machine',
      howToFind:
        'Machine à plateaux avec poignées basses de chaque côté (« Shrug ») : debout, tu hausses les épaules. Sinon : barre guidée (Smith machine).',
      imagePath: '/exercises/shrugs-halteres-machine.jpg',
    },
  },
  {
    slug: 'curl-incline',
    name: 'Curl incliné haltères',
    muscles: ['biceps'],
    equipment: 'haltères',
    imagePath: '/exercises/curl-incline.jpg',
    machineEquivalent: {
      name: 'Biceps Curl Technogym (pupitre à plateaux)',
      howToFind:
        'Machine jaune/noire avec pupitre incliné pour poser les bras, marquée « Biceps Curl » : tu enroules les poignées vers toi. (Photo : ta salle)',
      imagePath: '/exercises/perso/biceps.jpeg',
    },
  },
  {
    slug: 'curl-marteau',
    name: 'Curl marteau',
    muscles: ['biceps', 'avant-bras'],
    equipment: 'haltères',
    imagePath: '/exercises/curl-marteau.jpg',
    machineEquivalent: {
      name: 'Curl corde à la poulie basse',
      howToFind:
        'Poulie réglée en bas avec l’accessoire corde : prise neutre (pouces vers le haut), tu remontes la corde en gardant les coudes fixes.',
      imagePath: '/exercises/curl-marteau-machine.jpg',
    },
  },
  {
    slug: 'presse-a-cuisses',
    name: 'Presse à cuisses (pieds hauts)',
    muscles: ['quadriceps', 'fessiers', 'ischios'],
    equipment: 'machine',
    imagePath: '/exercises/presse-a-cuisses.jpg',
    machineEquivalent: {
      name: 'Squat machine à plateaux (alternative)',
      howToFind:
        'Machine jaune/noire à plateaux où tu pousses debout avec les jambes — alternative à la presse si elle est prise. (Photo : ta salle)',
      imagePath: '/exercises/perso/machine-pousser.jpeg',
    },
  },
  {
    slug: 'fentes-bulgares',
    name: 'Fentes bulgares haltères',
    muscles: ['quadriceps', 'fessiers'],
    equipment: 'haltères',
    imagePath: '/exercises/fentes-bulgares.jpg',
    machineEquivalent: {
      name: 'Fente bulgare à la Smith machine',
      howToFind:
        'Barre guidée (Smith machine) + banc derrière toi : pied arrière sur le banc, tu descends sur la jambe avant. Sinon : presse unilatérale (une jambe).',
      imagePath: '/exercises/fentes-bulgares-machine.jpg',
    },
  },
  {
    slug: 'rdl',
    name: 'RDL (soulevé de terre roumain)',
    muscles: ['ischios', 'fessiers', 'lombaires'],
    equipment: 'barre',
    imagePath: '/exercises/rdl.jpg',
    machineEquivalent: {
      name: 'RDL à la Smith machine',
      howToFind:
        'Barre guidée (Smith machine) : jambes presque tendues, tu descends la barre le long des cuisses en poussant les hanches en arrière. Complément guidé : leg curl allongé.',
      imagePath: '/exercises/rdl-machine.jpg',
    },
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
    name: 'Barre au front',
    muscles: ['triceps'],
    equipment: 'barre',
    imagePath: '/exercises/barre-au-front.jpg',
    machineEquivalent: {
      name: 'Machine extension triceps',
      howToFind:
        'Machine assise marquée « Triceps Extension » : coudes posés sur le support, tu tends les bras. Sinon : extension corde au-dessus de la tête à la poulie.',
      imagePath: '/exercises/barre-au-front-machine.jpg',
    },
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
        {
          type: 'superset',
          items: [
            { exerciseSlug: 'pec-fly', sets: 3, repsMin: 10, repsMax: 12 },
            { exerciseSlug: 'elevations-laterales', sets: 3, repsMin: 10, repsMax: 12 },
          ],
        },
        {
          type: 'superset',
          items: [
            { exerciseSlug: 'poulie-basse-croisee-pecs', sets: 3, repsMin: 10, repsMax: 12 },
            { exerciseSlug: 'oiseau-poulie-haute', sets: 3, repsMin: 10, repsMax: 12 },
          ],
        },
        { type: 'single', items: [{ exerciseSlug: 'pushdown-corde', sets: 3, repsMin: 10, repsMax: 12 }] },
        { type: 'circuit', items: [{ exerciseSlug: 'circuit-abdos', sets: 1 }] },
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
        {
          type: 'superset',
          items: [
            { exerciseSlug: 'curl-incline', sets: 3, repsMin: 10, repsMax: 12 },
            { exerciseSlug: 'curl-marteau', sets: 3, repsMin: 10, repsMax: 12 },
          ],
        },
        { type: 'circuit', items: [{ exerciseSlug: 'circuit-abdos', sets: 1 }] },
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
        {
          type: 'superset',
          items: [
            { exerciseSlug: 'leg-extension', sets: 3, repsMin: 10, repsMax: 12, note: 'Unilatéral' },
            { exerciseSlug: 'leg-curl', sets: 3, repsMin: 10, repsMax: 12, note: 'Unilatéral' },
          ],
        },
        { type: 'single', items: [{ exerciseSlug: 'mollets', sets: 3, repsMin: 20, repsMax: 20 }] },
        { type: 'circuit', items: [{ exerciseSlug: 'circuit-abdos', sets: 1 }] },
      ],
    },
    { weekday: 5, title: 'Repos', type: 'repos', blocks: [] },
    {
      weekday: 6,
      title: 'Épaules / Bras',
      type: 'muscu',
      blocks: [
        { type: 'single', items: [{ exerciseSlug: 'developpe-militaire-halteres', sets: 4, repsMin: 6, repsMax: 8, note: 'Actuellement 10 kg' }] },
        {
          type: 'superset',
          items: [
            { exerciseSlug: 'elevations-laterales', sets: 3, repsMin: 10, repsMax: 15, note: '1 série lourde 10-12 + 1 série légère 12-15 · 10 kg → 6 kg' },
            { exerciseSlug: 'rear-delt', sets: 3, repsMin: 10, repsMax: 15, note: '10 kg → 6 kg' },
          ],
        },
        {
          type: 'superset',
          items: [
            { exerciseSlug: 'curl-incline', sets: 3, repsMin: 10, repsMax: 12, note: '6 kg — facile, tu peux monter' },
            { exerciseSlug: 'barre-au-front', sets: 3, repsMin: 10, repsMax: 12, note: '6 kg — facile, tu peux monter' },
          ],
        },
        {
          type: 'superset',
          items: [
            { exerciseSlug: 'curl-marteau', sets: 3, repsMin: 10, repsMax: 12, note: '10 kg — dans le dur (10/8/10)' },
            { exerciseSlug: 'pushdown-corde', sets: 3, repsMin: 10, repsMax: 12, note: '10 kg — dans le dur' },
          ],
        },
        { type: 'single', items: [{ exerciseSlug: 'shrugs-halteres', sets: 3, repsMin: 12, repsMax: 15, note: '10 kg' }] },
        { type: 'circuit', items: [{ exerciseSlug: 'circuit-abdos', sets: 1 }] },
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
