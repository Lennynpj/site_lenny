import { Schema, model } from 'mongoose'

const machineEquivalentSchema = new Schema(
  {
    name: { type: String, required: true },
    howToFind: String,
    imagePath: String,
  },
  { _id: false }
)

const exerciseSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  muscles: [String],
  equipment: {
    type: String,
    enum: ['barre', 'haltères', 'poulie', 'machine', 'poids du corps', 'cardio'],
    default: 'machine',
  },
  imagePath: String,
  // Réglage matériel (surtout cable station : position de la poulie + accessoire)
  setup: String,
  // Équivalent en machine guidée à Fitness Park (null si l'exo est déjà une machine/poulie)
  machineEquivalent: { type: machineEquivalentSchema, default: null },

  // ── Démonstration (côté Lysa) ──────────────────────────────────
  // Deux photos départ/arrivée : affichées en alternance, ça fait un gif.
  photos: { type: [String], default: [] },
  // Identifiant YouTube d'une démo filmée (vraie personne, vrai mouvement).
  videoId: String,
  // Famille de mouvement, sert à choisir le petit dessin de la carte.
  pattern: String,
  // 2 ou 3 repères en français courant, pas un pavé technique.
  howTo: { type: [String], default: [] },
  // Ce qu'on compte : « 3 × 10 / jambe » et « 30 secondes » ne se saisissent
  // pas comme « 10 reps ».
  unit: {
    type: String,
    enum: ['reps', 'secondes', 'parJambe', 'parBras', 'parCote', 'max'],
    default: 'reps',
  },
})

export const Exercise = model('Exercise', exerciseSchema)
