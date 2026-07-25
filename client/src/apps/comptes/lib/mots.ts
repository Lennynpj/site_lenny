// Mise en forme en langage courant : aucun jargon, aucune abréviation.

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

/**
 * « 470 € » quand c'est rond, « 12,99 € » quand il y a des centimes.
 * On n'arrondit JAMAIS en silence : sinon 12,99 s'affiche « 13 € » et les
 * totaux affichés ne tombent plus juste.
 */
export function montant(n: number): string {
  const v = Math.abs(n ?? 0)
  const centimes = Math.round(v * 100) % 100 !== 0
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: centimes ? 2 : 0,
    maximumFractionDigits: centimes ? 2 : 0,
  }).format(v)
}

/** « juillet » */
export function moisLong(d: Date = new Date()): string {
  return MOIS[d.getMonth()]
}

/** « juillet 2026 » */
export function moisAnnee(d: Date = new Date()): string {
  return `${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

/** « aujourd'hui », « hier », « lundi 21 juillet » */
export function jourRelatif(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const jour = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const ecart = Math.round((jour(new Date()) - jour(d)) / 86_400_000)
  if (ecart === 0) return "aujourd'hui"
  if (ecart === 1) return 'hier'
  if (ecart === -1) return 'demain'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** « le 5 août, dans 11 jours » */
export function echeance(iso: string, joursRestants: number): string {
  const d = new Date(iso)
  const quand = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  if (joursRestants === 0) return `le ${quand}, aujourd'hui`
  if (joursRestants === 1) return `le ${quand}, demain`
  return `le ${quand}, dans ${joursRestants} jours`
}

/** « le 5 de chaque mois » */
export function jourDuMois(jour: number): string {
  return jour === 1 ? 'le 1er de chaque mois' : `le ${jour} de chaque mois`
}

/** Combien de jours restent avant la fin du mois affiché. */
export function finDuMois(d: Date = new Date()): { jour: number; restants: number } {
  const dernier = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const restants = Math.max(
    0,
    Math.round(
      (dernier.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86_400_000
    )
  )
  return { jour: dernier.getDate(), restants }
}

/** Traduit une erreur technique en phrase compréhensible et actionnable. */
export function messageErreur(e: unknown, bouton = 'Réessayer'): string {
  const brut = e instanceof Error ? e.message : String(e ?? '')
  if (/401|authentifié|expir/i.test(brut)) return 'Ta session a expiré. Retape ton code pour continuer.'
  if (/incorrect|mot de passe/i.test(brut)) return "Ce code n'est pas le bon. Réessaie."
  if (/Failed to fetch|NetworkError|network/i.test(brut))
    return `Le téléphone n'arrive pas à se connecter à internet. Vérifie ta connexion, puis appuie sur « ${bouton} ».`
  return `Ça n'a pas marché. Vérifie que tu es connectée à internet, puis appuie sur « ${bouton} ».`
}

/** Clé « YYYY-MM » pour l'API summary. */
export function cleMois(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function memeMois(iso: string | undefined, d: Date): boolean {
  if (!iso) return false
  const x = new Date(iso)
  return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth()
}
