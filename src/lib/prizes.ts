/**
 * Liste des lots de la tombola, dans l'ordre où ils sont tirés.
 *
 * Le Nᵉ nom tiré remporte le Nᵉ lot de cette liste. Adapte librement l'ordre :
 * beaucoup de tombolas tirent du plus petit lot au plus gros (gros lot en
 * dernier, pour garder le suspense) — dans ce cas, place le lot principal en
 * bas de la liste.
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

/**
 * Lot associé à un rang de tirage (1er tiré = index 0).
 * Au-delà de la liste des lots, renvoie `null` (tirages « hors lot »).
 */
export function prizeForRank(rank: number): string | null {
  return PRIZES[rank] ?? null
}
