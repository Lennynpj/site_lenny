import type { Request } from 'express'

/* Qui consulte. Deux personnes se partagent l'app ; à défaut c'est Lenny,
   pour que les séances enregistrées avant l'arrivée de Lysa restent les
   siennes sans avoir à les migrer. */
export function owner(req: Request): 'lenny' | 'lysa' {
  return req.query.owner === 'lysa' ? 'lysa' : 'lenny'
}
