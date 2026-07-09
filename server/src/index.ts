import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import exercisesRouter from './routes/exercises.js'
import programRouter from './routes/program.js'
import sessionsRouter from './routes/sessions.js'
import comptesRouter from './routes/comptes.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/exercises', exercisesRouter)
app.use('/api/program', programRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/comptes', comptesRouter)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/site_lenny'
const PORT = Number(process.env.PORT) || 3001

await mongoose.connect(MONGODB_URI)
console.log(`MongoDB connecté : ${MONGODB_URI}`)

app.listen(PORT, () => {
  console.log(`API démarrée : http://localhost:${PORT}/api/health`)
})
