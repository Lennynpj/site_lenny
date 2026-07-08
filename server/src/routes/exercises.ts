import { Router } from 'express'
import { Exercise } from '../models/Exercise.js'

const router = Router()

router.get('/', async (_req, res) => {
  const exercises = await Exercise.find().sort({ name: 1 })
  res.json(exercises)
})

export default router
