import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Asset } from '../../../lib/comptes'
import { montant } from '../lib/mots'

/* Prévision d'épargne, volontairement simple :
   « si tu continues à mettre X € de côté chaque mois, voilà ce que tu auras ».
   Les intérêts ne sont pris en compte que si un taux a été renseigné. */

/** Solde au bout de `mois`, versements réguliers + intérêts composés éventuels. */
export function soldeDans(assets: Asset[], mois: number): number {
  return assets.reduce((total, a) => {
    const depart = a.balance || 0
    const versement = a.monthlyContribution || 0
    const taux = (a.annualRate || 0) / 100 / 12
    if (taux === 0) return total + depart + versement * mois
    const facteur = Math.pow(1 + taux, mois)
    return total + depart * facteur + versement * ((facteur - 1) / taux)
  }, 0)
}

const JALONS = [
  { mois: 12, mot: 'Dans 1 an' },
  { mois: 24, mot: 'Dans 2 ans' },
  { mois: 60, mot: 'Dans 5 ans' },
]

export default function Prevision({ assets }: { assets: Asset[] }) {
  const versementTotal = assets.reduce((s, a) => s + (a.monthlyContribution || 0), 0)
  const aujourdhui = soldeDans(assets, 0)

  // Une étiquette tous les 2 ans seulement : sur un écran de téléphone, six
  // libellés se chevauchent et le dernier se fait couper.
  const donnees = Array.from({ length: 61 }, (_, m) => ({
    mois: m,
    etiquette: m === 0 ? "Auj." : m % 24 === 0 ? `${m / 12} ans` : '',
    somme: Math.round(soldeDans(assets, m)),
  }))

  if (versementTotal === 0) {
    return (
      <div className="rounded-carte border border-trait bg-papier p-5">
        <p className="text-corps text-encre">
          Indique combien tu mets de côté chaque mois dans une de tes réserves, et je te dirai ce
          que tu auras plus tard.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-carte border border-trait bg-papier p-5">
      <p className="text-corps text-encre">
        Si tu continues à mettre{' '}
        <span className="font-semibold">{montant(versementTotal)} de côté chaque mois</span> :
      </p>

      <dl className="mt-4 space-y-2.5">
        {JALONS.map((j) => {
          const somme = soldeDans(assets, j.mois)
          return (
            <div key={j.mois} className="flex items-baseline gap-3 border-b border-trait pb-2.5 last:border-0">
              <dt className="flex-1 text-corps text-encre">{j.mot}</dt>
              <dd className="text-montant font-semibold text-encre">{montant(somme)}</dd>
              <dd className="w-24 text-right text-secondaire text-vert">
                + {montant(somme - aujourdhui)}
              </dd>
            </div>
          )
        })}
      </dl>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={donnees} margin={{ top: 4, right: 26, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="degradeEpargne" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a56db" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#1a56db" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e7eaee" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="etiquette"
              stroke="#4a515a"
              fontSize={13}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              stroke="#4a515a"
              fontSize={13}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0d5dd',
                borderRadius: 12,
                fontSize: 15,
                color: '#16191d',
              }}
              formatter={(v) => [montant(Number(v)), 'Tu auras']}
              labelFormatter={(_, p) => {
                const m = p?.[0]?.payload?.mois ?? 0
                if (m === 0) return "Aujourd'hui"
                if (m < 12) return `Dans ${m} mois`
                const ans = Math.floor(m / 12)
                const reste = m % 12
                return `Dans ${ans} an${ans > 1 ? 's' : ''}${reste ? ` et ${reste} mois` : ''}`
              }}
            />
            <Area
              type="monotone"
              dataKey="somme"
              stroke="#1a56db"
              strokeWidth={2.5}
              fill="url(#degradeEpargne)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-secondaire text-encre-2">
        C'est une estimation : elle suppose que tu mets la même somme de côté tous les mois.
      </p>
    </div>
  )
}
