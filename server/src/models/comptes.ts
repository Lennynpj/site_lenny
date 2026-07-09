// Modèles de l'app Comptes (budget + patrimoine + projection)
import { Schema, model } from 'mongoose'

// Revenu — récurrent (salaire…) ou ponctuel
const incomeSchema = new Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['recurrent', 'ponctuel'], default: 'recurrent' },
    dayOfMonth: { type: Number, min: 1, max: 31 }, // si récurrent
    date: Date, // si ponctuel
    frequency: { type: String, enum: ['mensuel', 'annuel'], default: 'mensuel' },
    category: String,
    active: { type: Boolean, default: true },
    note: String,
  },
  { timestamps: true }
)

// Abonnement / dépense récurrente avec date de prélèvement
const subscriptionSchema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    dayOfMonth: { type: Number, required: true, min: 1, max: 31 },
    frequency: { type: String, enum: ['mensuel', 'annuel', 'hebdo'], default: 'mensuel' },
    category: { type: String, default: 'autre' },
    active: { type: Boolean, default: true },
    color: String,
    note: String,
  },
  { timestamps: true }
)

// Modèle de dépense réutilisable (ex. « Courses » à 50 € par défaut)
const expenseTemplateSchema = new Schema(
  {
    label: { type: String, required: true },
    defaultAmount: { type: Number, default: 0 },
    category: { type: String, default: 'autre' },
    color: String,
    icon: String,
  },
  { timestamps: true }
)

// Mouvement ponctuel : dépense, rentrée exceptionnelle, ou mise de côté (épargne)
const transactionSchema = new Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: () => new Date() },
    kind: { type: String, enum: ['depense', 'revenu', 'epargne'], default: 'depense' },
    category: String,
    templateId: { type: Schema.Types.ObjectId, ref: 'ExpenseTemplate' },
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset' }, // si épargne → placement ciblé
    note: String,
  },
  { timestamps: true }
)

// Compte / placement (compte courant, Livret A, PEA, perso…)
const assetSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['courant', 'livret', 'pea', 'assurance-vie', 'especes', 'autre'],
      default: 'autre',
    },
    balance: { type: Number, default: 0 },
    monthlyContribution: { type: Number, default: 0 }, // versement auto (projection)
    annualRate: { type: Number, default: 0 }, // % rendement annuel (intérêts composés)
    note: String,
  },
  { timestamps: true }
)

export const Income = model('Income', incomeSchema)
export const Subscription = model('Subscription', subscriptionSchema)
export const ExpenseTemplate = model('ExpenseTemplate', expenseTemplateSchema)
export const Transaction = model('Transaction', transactionSchema)
export const Asset = model('Asset', assetSchema)
