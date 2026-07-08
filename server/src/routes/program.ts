import { Router } from 'express'
import { Program } from '../models/Program.js'

const router = Router()

router.get('/', async (_req, res) => {
  const program = await Program.findOne()
  if (!program) {
    res.status(404).json({ error: 'Aucun programme. Lance le seed : npm run seed' })
    return
  }
  res.json(program)
})

router.put('/', async (req, res) => {
  const { name, days } = req.body
  const program = await Program.findOneAndUpdate(
    {},
    { name, days },
    { new: true, upsert: true, runValidators: true }
  )
  res.json(program)
})

export default router
