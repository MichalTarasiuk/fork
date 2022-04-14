import { useCallback } from 'react'

import { useRemind } from 'store/store'
import { Note } from './note'
import './notes.css'

export const NotesList = () => {
  const { mind, setMind } = useRemind((state) => state.notes)

  const edit = useCallback(
    (content: string, id: number) => {
      setMind((mind) => ({
        notes: mind.notes.map((note) => note.id === id ? { ...note, content } : note)
      }))
    },
    [setMind]
  )

  const remove = useCallback(
    (id: number) => {
      setMind((mind) => ({
        notes: mind.notes.filter((note) => note.id !== id),
      }))
    },
    [setMind]
  )

  return (
    <ul className="list">
      {mind.notes.map((note) => (
        <Note data={note} onEdit={edit} onRemove={remove} key={note.id} />
      ))}
    </ul>
  )
}
