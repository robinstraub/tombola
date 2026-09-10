/**
 * Liste des lots de la tombola, du PLUS PETIT au PLUS GROS.
 *
 * On la stocke dans cet ordre « croissant » et l'ordre de tirage effectif est
 * décidé à l'exécution (cf. `prizeForRank`). Par défaut on tire du plus petit
 * au plus gros (gros lot en dernier, pour le suspense).
 *
 * Source : affiche « Grande Tombola Judo Pays Vilaine 2026 ».
 * Les lots exacts et leur ordre restent à confirmer.
 */
export const PRIZES: string[] = [
  '2 places de cinéma',
  '1 panier garni',
  '1 panier garni',
  '2 repas au restaurant Rosa (Châteaubourg)',
  '1 judogi',
  '2 places pour le concert de Céline Dion',
]

/** Sens de tirage des lots. */
export type PrizeOrder = 'smallToBig' | 'bigToSmall'

/**
 * Lot associé à un rang de tirage (1er tiré = rang 0).
 *
 * - `smallToBig` (défaut) : le rang 0 reçoit le plus petit lot, le gros lot
 *   tombe en dernier (suspense).
 * - `bigToSmall` : le rang 0 reçoit le plus gros lot.
 *
 * Au-delà de la liste des lots, renvoie `null` (tirages « hors lot »).
 */
export function prizeForRank(rank: number, order: PrizeOrder = 'smallToBig'): string | null {
  const list = order === 'bigToSmall' ? [...PRIZES].reverse() : PRIZES
  return list[rank] ?? null
}
