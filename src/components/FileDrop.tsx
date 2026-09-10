import { useCallback, useRef, useState } from 'react'

import { ParseError, parseParticipants } from '../lib/parseParticipants'
import type { Participant } from '../types'

interface FileDropProps {
  onParticipants: (participants: Participant[], fileName: string) => void
}

const ACCEPTED = '.xlsx,.xls,.csv,.numbers'

export function FileDrop({ onParticipants }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      setError(null)
      setLoading(true)
      try {
        const participants = await parseParticipants(file)
        onParticipants(participants, file.name)
      } catch (err) {
        setError(
          err instanceof ParseError
            ? err.message
            : 'Une erreur est survenue à la lecture du fichier.',
        )
      } finally {
        setLoading(false)
      }
    },
    [onParticipants],
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
      setDragging(false)
      void handleFile(event.dataTransfer.files[0])
    },
    [handleFile],
  )

  return (
    <div className="file-drop">
      <button
        type="button"
        className={`dropzone${isDragging ? ' dropzone--active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={loading}
      >
        <span className="dropzone__glyph" aria-hidden="true">
          福
        </span>
        <span className="dropzone__title">
          {loading ? 'Lecture en cours…' : 'Déposer la liste des participants'}
        </span>
        <span className="dropzone__hint">
          Glisse un fichier .xlsx / .csv / .numbers ici, ou clique pour parcourir
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        hidden
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      {error && <p className="file-drop__error">{error}</p>}

      <a
        className="file-drop__sample"
        href={`${import.meta.env.BASE_URL}participants-exemple.xlsx`}
        download
      >
        <span aria-hidden="true">↓</span> Télécharger un fichier d’exemple
      </a>
    </div>
  )
}
