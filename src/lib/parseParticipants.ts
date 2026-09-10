import type { Participant } from '../types'

export class ParseError extends Error {}

/**
 * Reads a spreadsheet and extracts the list of tombola entries.
 *
 * Supported formats: .xlsx, .xls, .csv and Apple .numbers (SheetJS reads them
 * all). We read the first worksheet.
 *
 * Column detection:
 * - If the header row names a "last name" column ("Nom participant", "Nom"...),
 *   we use it — and if a matching "first name" column exists ("Prénom
 *   participant"...), we join them ("Garance Divet").
 * - Otherwise we fall back to the FIRST column and keep every row as data, so a
 *   plain single-column list of names just works.
 *
 * Entries vs. people: a raffle export (e.g. HelloAsso) has ONE ROW PER TICKET,
 * so someone who bought 10 tickets appears 10 times — and must keep 10 chances
 * in the draw. We therefore DO NOT de-duplicate by name by default: every row
 * is a chance. (Truly empty rows are still skipped.)
 */
export async function parseParticipants(file: File): Promise<Participant[]> {
  // Loaded lazily so the ~500 kB SheetJS bundle is only fetched when a user
  // actually drops a file, keeping the initial SPA payload light.
  const XLSX = await import('xlsx')

  const buffer = await file.arrayBuffer()
  const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv'

  let workbook: ReturnType<typeof XLSX.read>
  try {
    if (isCsv) {
      // Decode CSV explicitly as UTF-8 so accented names (René, Éric…) are not
      // mangled; SheetJS's binary path can misread the encoding otherwise.
      const text = new TextDecoder('utf-8').decode(buffer)
      workbook = XLSX.read(text, { type: 'string' })
    } else {
      workbook = XLSX.read(buffer, { type: 'array' })
    }
  } catch (cause) {
    throw new ParseError(
      'Impossible de lire le fichier. Formats acceptés : .xlsx, .xls, .csv ou .numbers (Apple). ' +
        'Depuis Numbers, tu peux aussi exporter en Excel/CSV.',
      { cause },
    )
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

  // Only treat the first row as a header when it explicitly names a column
  // ("Nom", "Nom participant"...). Otherwise every row is data — this
  // guarantees a plain list of names never loses its first entry.
  const { lastNameColumn, firstNameColumn } = findNameColumns(rows[0])
  const nameColumn = lastNameColumn ?? 0
  const startRow = lastNameColumn === null ? 0 : 1

  const participants: Participant[] = []

  for (let r = startRow; r < rows.length; r += 1) {
    const last = String(rows[r]?.[nameColumn] ?? '').trim()
    const first =
      firstNameColumn !== null ? String(rows[r]?.[firstNameColumn] ?? '').trim() : ''

    // "Prénom Nom" when both are present, otherwise whichever we have.
    const name = [first, last].filter(Boolean).join(' ').trim()
    if (!name) continue

    // One row = one ticket = one chance: no de-duplication by name. The id is
    // unique per row so repeat buyers keep every entry they paid for.
    participants.push({ id: `${r}-${name}`, name })
  }

  if (participants.length === 0) {
    throw new ParseError('Aucun participant trouvé dans le fichier.')
  }

  return participants
}

// Hints ordered by strength: a specific "nom participant" wins over a bare
// "nom", which wins over the softer fallbacks. We scan hints in this order so
// an export with several name-ish columns still picks the right one.
const LAST_NAME_HINTS = ['nom participant', 'nom du participant', 'nom', 'name', 'gagnant', 'personne']
const FIRST_NAME_HINTS = ['prénom participant', 'prénom du participant', 'prénom', 'prenom', 'first name']

/**
 * Locates the last-name column (and, when present, the matching first-name
 * column) from the header row. Returns nulls when no header is recognised, in
 * which case the caller falls back to the first column with every row as data.
 *
 * A "nom payeur"/"nom du payeur" column is deliberately ignored: in a HelloAsso
 * export the participant and the payer can differ, and we draw participants.
 */
function findNameColumns(header: unknown[] | undefined): {
  lastNameColumn: number | null
  firstNameColumn: number | null
} {
  if (!header || header.length === 0) {
    return { lastNameColumn: null, firstNameColumn: null }
  }

  const cells = header.map((cell) => String(cell ?? '').toLocaleLowerCase().trim())

  const matchColumn = (hints: string[]): number | null => {
    for (const hint of hints) {
      const index = cells.findIndex(
        (cell) => cell.includes(hint) && !cell.includes('payeur') && !cell.includes('payé'),
      )
      if (index >= 0) return index
    }
    return null
  }

  return {
    lastNameColumn: matchColumn(LAST_NAME_HINTS),
    firstNameColumn: matchColumn(FIRST_NAME_HINTS),
  }
}
