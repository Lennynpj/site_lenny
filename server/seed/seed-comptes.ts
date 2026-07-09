// Seed d'exemple pour l'app Comptes (démo). N'écrase PAS les données Muscu.
// Usage : npm run seed:comptes
import 'dotenv/config'
import mongoose from 'mongoose'
import { Income, Subscription, ExpenseTemplate, Transaction, Asset } from '../src/models/comptes.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/site_lenny'
await mongoose.connect(MONGODB_URI)
console.log(`Connecté à ${MONGODB_URI}`)

await Promise.all([
  Income.deleteMany({}),
  Subscription.deleteMany({}),
  ExpenseTemplate.deleteMany({}),
  Transaction.deleteMany({}),
  Asset.deleteMany({}),
])

await Income.create([
  { label: 'Salaire', amount: 2100, type: 'recurrent', dayOfMonth: 28, frequency: 'mensuel', category: 'salaire' },
  { label: 'Freelance', amount: 300, type: 'recurrent', dayOfMonth: 5, frequency: 'mensuel', category: 'freelance' },
])

await Subscription.create([
  { name: 'Loyer', amount: 750, dayOfMonth: 3, category: 'logement' },
  { name: 'Salle de sport', amount: 30, dayOfMonth: 5, category: 'sport' },
  { name: 'Netflix', amount: 13.49, dayOfMonth: 15, category: 'streaming' },
  { name: 'Forfait mobile', amount: 11.99, dayOfMonth: 12, category: 'télécom' },
  { name: 'Assurance habitation', amount: 120, dayOfMonth: 10, frequency: 'annuel', category: 'assurance' },
])

await ExpenseTemplate.create([
  { label: 'Courses', defaultAmount: 50, category: 'alimentation', color: '#34d399' },
  { label: 'Essence', defaultAmount: 60, category: 'transport', color: '#f59e0b' },
  { label: 'Resto', defaultAmount: 25, category: 'sorties', color: '#f472b6' },
])

const courant = await Asset.create({ name: 'Compte courant', type: 'courant', balance: 1450 })
await Asset.create([
  { name: 'Livret A', type: 'livret', balance: 4200, monthlyContribution: 150, annualRate: 3 },
  { name: 'PEA', type: 'pea', balance: 6800, monthlyContribution: 100, annualRate: 6 },
])

// Quelques dépenses variables du mois en cours pour la démo
const now = new Date()
await Transaction.create([
  { label: 'Courses', amount: 63, kind: 'depense', category: 'alimentation', date: new Date(now.getFullYear(), now.getMonth(), 4) },
  { label: 'Essence', amount: 58, kind: 'depense', category: 'transport', date: new Date(now.getFullYear(), now.getMonth(), 8) },
  { label: 'Resto', amount: 32, kind: 'depense', category: 'sorties', date: new Date(now.getFullYear(), now.getMonth(), 11) },
])

console.log('Seed Comptes terminé.', { courant: courant.name })
await mongoose.disconnect()
