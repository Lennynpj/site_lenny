import { Schema, model } from 'mongoose'

const itemSchema = new Schema(
  {
    exerciseSlug: { type: String, required: true },
    sets: { type: Number, default: 3 },
    repsMin: Number,
    repsMax: Number,
    note: String,
  },
  { _id: false }
)

const blockSchema = new Schema(
  {
    type: { type: String, enum: ['single', 'superset', 'circuit'], default: 'single' },
    items: { type: [itemSchema], default: [] },
  },
  { _id: false }
)

const daySchema = new Schema(
  {
    // 0 = dimanche ... 6 = samedi (convention JavaScript Date.getDay())
    weekday: { type: Number, required: true, min: 0, max: 6 },
    title: { type: String, required: true },
    type: { type: String, enum: ['muscu', 'run', 'repos'], default: 'muscu' },
    blocks: { type: [blockSchema], default: [] },
  },
  { _id: false }
)

const programSchema = new Schema(
  {
    name: { type: String, required: true },
    days: { type: [daySchema], default: [] },
  },
  { timestamps: true }
)

export const Program = model('Program', programSchema)
