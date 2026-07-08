import { Schema, model } from 'mongoose'

const setSchema = new Schema(
  {
    weight: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    done: { type: Boolean, default: false },
  },
  { _id: false }
)

const entrySchema = new Schema(
  {
    exerciseSlug: { type: String, required: true },
    exerciseName: String,
    targetSets: Number,
    repsMin: Number,
    repsMax: Number,
    sets: { type: [setSchema], default: [] },
  },
  { _id: false }
)

const workoutSessionSchema = new Schema(
  {
    date: { type: Date, required: true },
    weekday: Number,
    title: String,
    entries: { type: [entrySchema], default: [] },
    note: String,
  },
  { timestamps: true }
)

export const WorkoutSession = model('WorkoutSession', workoutSessionSchema)
