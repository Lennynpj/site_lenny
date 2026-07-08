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
  // Équivalent en machine guidée à Fitness Park (null si l'exo est déjà une machine/poulie)
  machineEquivalent: { type: machineEquivalentSchema, default: null },
})

export const Exercise = model('Exercise', exerciseSchema)
