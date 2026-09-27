import { Router } from 'express'
import { WorkoutSession } from '../models/WorkoutSession.js'
import { owner } from '../lib/owner.js'

const router = Router()

router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200)
  const sessions = await WorkoutSession.find({ owner: owner(req) }).sort({ date: -1 }).limit(limit)
  res.json(sessions)
})

// Dernière performance enregistrée pour chaque exercice :
// { "developpe-couche-barre": { date, sets: [{weight, reps}] }, ... }
router.get('/last-perf', async (req, res) => {
  const sessions = await WorkoutSession.find({ owner: owner(req) }).sort({ date: -1 }).limit(100)
  const lastPerf: Record<string, { date: Date; sets: { weight: number; reps: number }[] }> = {}
  for (const session of sessions) {
    for (const entry of session.entries) {
      if (lastPerf[entry.exerciseSlug]) continue
      const doneSets = entry.sets.filter((s) => s.done && (s.weight > 0 || s.reps > 0))
      if (doneSets.length === 0) continue
      lastPerf[entry.exerciseSlug] = {
        date: session.date,
        sets: doneSets.map((s) => ({ weight: s.weight, reps: s.reps })),
      }
    }
  }
  res.json(lastPerf)
})

// Historique d'un exercice pour le graphique de progression :
// [{ date, maxWeight, totalReps }] trié par date croissante
router.get('/progress/:slug', async (req, res) => {
  const sessions = await WorkoutSession.find({
    owner: owner(req),
    'entries.exerciseSlug': req.params.slug,
  }).sort({ date: 1 })
  const points = sessions.flatMap((session) => {
    const entry = session.entries.find((e) => e.exerciseSlug === req.params.slug)
    if (!entry) return []
    const doneSets = entry.sets.filter((s) => s.done && (s.weight > 0 || s.reps > 0))
    if (doneSets.length === 0) return []
    return [
      {
        date: session.date,
        maxWeight: Math.max(...doneSets.map((s) => s.weight)),
        totalReps: doneSets.reduce((sum, s) => sum + s.reps, 0),
      },
    ]
  })
  res.json(points)
})

router.post('/', async (req, res) => {
  const session = await WorkoutSession.create({ ...req.body, owner: owner(req) })
  res.status(201).json(session)
})

router.delete('/:id', async (req, res) => {
  // On ne supprime que dans ses propres séances.
  await WorkoutSession.findOneAndDelete({ _id: req.params.id, owner: owner(req) })
  res.status(204).end()
})

export default router
