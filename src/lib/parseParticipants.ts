import type { Participant } from '../types'

export class ParseError extends Error {}

/**
 * Reads a spreadsheet (xlsx/xls/csv) and extracts a list of participants.
 *
 * Contract: any CSV/XLSX works. We read the first worksheet and, if the header
 * row happens to name a column ("nom", "name", "président"...), we use it as a
 * convenience — but the default and fallback is always the FIRST column. So a
 * plain file with names in column A just works. Empty cells, a leading header
 * row, and duplicates are skipped.
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

  // Only treat the first row as a header when it explicitly names a column
  // ("Nom", "Président"...). Otherwise every row is data — this guarantees a
  // plain list of names never loses its first entry.
  const headerColumn = findHeaderColumn(rows[0])
  const nameColumn = headerColumn ?? 0
  const startRow = headerColumn === null ? 0 : 1

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

const NAME_HEADER_HINTS = [
  'nom',
  'name',
  'prénom',
  'prenom',
  'participant',
  'gagnant',
  'personne',
  'président',
  'president',
]

/**
 * If the first row looks like a header naming a column ("Nom", "Président"...),
 * returns that column's index. Returns `null` when there is no recognisable
 * header — in that case the caller falls back to the first column and keeps
 * every row as data.
 */
function findHeaderColumn(header: unknown[] | undefined): number | null {
  if (!header || header.length === 0) return null
  const index = header.findIndex((cell) =>
    NAME_HEADER_HINTS.some((hint) => String(cell).toLocaleLowerCase().includes(hint)),
  )
  return index >= 0 ? index : null
}
