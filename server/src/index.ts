import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { Program } from './models/Program.js'
import { WorkoutSession } from './models/WorkoutSession.js'
import exercisesRouter from './routes/exercises.js'
import programRouter from './routes/program.js'
import sessionsRouter from './routes/sessions.js'
import comptesAuthRouter from './routes/comptes-auth.js'
import comptesRouter from './routes/comptes.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/exercises', exercisesRouter)
app.use('/api/program', programRouter)
app.use('/api/sessions', sessionsRouter)
// Auth d'abord (routes publiques /profiles, /auth/*), puis les données (protégées)
app.use('/api/comptes', comptesAuthRouter)
app.use('/api/comptes', comptesRouter)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/site_lenny'
const PORT = Number(process.env.PORT) || 3001

await mongoose.connect(MONGODB_URI)
console.log(`MongoDB connecté : ${MONGODB_URI}`)

/* L'app n'a longtemps connu qu'une personne : le programme et les séances
   enregistrés avant l'arrivée de Lysa n'ont pas de propriétaire. On les
   rattache à Lenny. Idempotent : les fois suivantes, 0 document modifié. */
const sansProprietaire = { owner: { $exists: false } }
const versLenny = { $set: { owner: 'lenny' as const } }
const [programmes, seances] = await Promise.all([
  Program.updateMany(sansProprietaire, versLenny),
  WorkoutSession.updateMany(sansProprietaire, versLenny),
])
if (programmes.modifiedCount || seances.modifiedCount)
  console.log(
    `Rattaché à Lenny : ${programmes.modifiedCount} programme(s), ${seances.modifiedCount} séance(s)`
  )

app.listen(PORT, () => {
  console.log(`API démarrée : http://localhost:${PORT}/api/health`)
})
