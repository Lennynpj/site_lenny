import { Router } from 'express'
import { Program } from '../models/Program.js'
import { owner } from '../lib/owner.js'

const router = Router()

router.get('/', async (req, res) => {
  const program = await Program.findOne({ owner: owner(req) })
  if (!program) {
    res.status(404).json({ error: 'Aucun programme. Lance le seed : npm run seed' })
    return
  }
  res.json(program)
})

router.put('/', async (req, res) => {
  const { name, days } = req.body
  const program = await Program.findOneAndUpdate(
    { owner: owner(req) },
    { name, days, owner: owner(req) },
    { new: true, upsert: true, runValidators: true }
  )
  res.json(program)
})

export default router
