// Seed d'exemple pour l'app Comptes (démo) sous un profil « Lenny ».
// N'écrase PAS les données Muscu. Usage : npm run seed:comptes
import 'dotenv/config'
import mongoose from 'mongoose'
import { Profile, Income, Subscription, ExpenseTemplate, Transaction, Asset } from '../src/models/comptes.js'
import { hashPassword } from '../src/lib/auth.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/site_lenny'
await mongoose.connect(MONGODB_URI)
console.log(`Connecté à ${MONGODB_URI}`)

// Profil de démo « Lenny » (mot de passe : 1234) — à changer depuis l'app
let lenny = await Profile.findOne({ name: 'Lenny' })
if (!lenny) {
  const { hash, salt } = hashPassword('1234')
  lenny = await Profile.create({ name: 'Lenny', avatarColor: '#34d399', passwordHash: hash, passwordSalt: salt })
  console.log('Profil « Lenny » créé (mot de passe : 1234)')
}
const profileId = lenny._id

// Réinitialise UNIQUEMENT les données de ce profil
await Promise.all([
  Income.deleteMany({ profileId }),
  Subscription.deleteMany({ profileId }),
  ExpenseTemplate.deleteMany({ profileId }),
  Transaction.deleteMany({ profileId }),
  Asset.deleteMany({ profileId }),
])

await Income.create([
  { profileId, label: 'Salaire', amount: 2100, type: 'recurrent', dayOfMonth: 28, frequency: 'mensuel', category: 'salaire' },
  { profileId, label: 'Freelance', amount: 300, type: 'recurrent', dayOfMonth: 5, frequency: 'mensuel', category: 'freelance' },
])

await Subscription.create([
  { profileId, name: 'Loyer', amount: 750, dayOfMonth: 3, category: 'logement' },
  { profileId, name: 'Salle de sport', amount: 30, dayOfMonth: 5, category: 'sport' },
  { profileId, name: 'Netflix', amount: 13.49, dayOfMonth: 15, category: 'streaming' },
  { profileId, name: 'Forfait mobile', amount: 11.99, dayOfMonth: 12, category: 'télécom' },
  { profileId, name: 'Assurance habitation', amount: 120, dayOfMonth: 10, frequency: 'annuel', category: 'assurance' },
])

await ExpenseTemplate.create([
  { profileId, label: 'Courses', defaultAmount: 50, category: 'alimentation', color: '#34d399' },
  { profileId, label: 'Essence', defaultAmount: 60, category: 'transport', color: '#f59e0b' },
  { profileId, label: 'Resto', defaultAmount: 25, category: 'sorties', color: '#f472b6' },
])

await Asset.create({ profileId, name: 'Compte courant', type: 'courant', balance: 1450 })
await Asset.create([
  { profileId, name: 'Livret A', type: 'livret', balance: 4200, monthlyContribution: 150, annualRate: 3 },
  { profileId, name: 'PEA', type: 'pea', balance: 6800, monthlyContribution: 100, annualRate: 6 },
])

const now = new Date()
await Transaction.create([
  { profileId, label: 'Courses', amount: 63, kind: 'depense', category: 'alimentation', date: new Date(now.getFullYear(), now.getMonth(), 4) },
  { profileId, label: 'Essence', amount: 58, kind: 'depense', category: 'transport', date: new Date(now.getFullYear(), now.getMonth(), 8) },
  { profileId, label: 'Resto', amount: 32, kind: 'depense', category: 'sorties', date: new Date(now.getFullYear(), now.getMonth(), 11) },
])

console.log('Seed Comptes terminé sous le profil', lenny.name)
await mongoose.disconnect()
