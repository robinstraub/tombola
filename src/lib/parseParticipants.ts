import type { Participant } from '../types'

export class ParseError extends Error {}

/**
 * Reads a spreadsheet (xlsx/xls/csv) and extracts a list of participants.
 *
 * Heuristics kept deliberately simple: we look at the first worksheet, try to
 * find a column that looks like a name (header contains "nom", "name",
 * "prénom", "participant"...) and otherwise fall back to the first column.
 * Empty cells and an eventual header row are skipped.
 */
export async function parseParticipants(file: File): Promise<Participant[]> {
  // Loaded lazily so the ~500 kB SheetJS bundle is only fetched when a user
  // actually drops a file, keeping the initial SPA payload light.
  const XLSX = await import('xlsx')

  const buffer = await file.arrayBuffer()

  let workbook: ReturnType<typeof XLSX.read>
  try {
    workbook = XLSX.read(buffer, { type: 'array' })
  } catch (cause) {
    throw new ParseError('Impossible de lire le fichier. Vérifie que c’est bien un .xlsx / .csv.', {
      cause,
    })
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new ParseError('Le fichier ne contient aucune feuille.')
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: '',
  })

  if (rows.length === 0) {
    throw new ParseError('La feuille est vide.')
  }

  const nameColumn = findNameColumn(rows)
  const startRow = looksLikeHeader(rows[0]) ? 1 : 0

  const seen = new Set<string>()
  const participants: Participant[] = []

  for (let r = startRow; r < rows.length; r += 1) {
    const cell = rows[r]?.[nameColumn]
    const name = String(cell ?? '').trim()
    if (!name) continue

    // De-duplicate on the visible name so nobody is entered twice.
    const key = name.toLocaleLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    participants.push({ id: `${r}-${name}`, name })
  }

  if (participants.length === 0) {
    throw new ParseError('Aucun participant trouvé dans le fichier.')
  }

  return participants
}

const NAME_HEADER_HINTS = ['nom', 'name', 'prénom', 'prenom', 'participant', 'gagnant', 'personne']

function findNameColumn(rows: unknown[][]): number {
  const header = rows[0]
  if (looksLikeHeader(header)) {
    const index = header.findIndex((cell) =>
      NAME_HEADER_HINTS.some((hint) => String(cell).toLocaleLowerCase().includes(hint)),
    )
    if (index >= 0) return index
  }
  return 0
}

/** A header row is one where no cell looks like a number. */
function looksLikeHeader(row: unknown[] | undefined): boolean {
  if (!row || row.length === 0) return false
  const nonEmpty = row.filter((cell) => String(cell ?? '').trim() !== '')
  if (nonEmpty.length === 0) return false
  return nonEmpty.every((cell) => Number.isNaN(Number(String(cell).trim())))
}
