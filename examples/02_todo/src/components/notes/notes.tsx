import { useCallback } from 'react'

import { useRemest } from 'store/store'
import { Note } from './note'
import './notes.css'

export const NotesList = () => {
  const { state, setState } = useRemest((state) => state.notes)

  const edit = useCallback(
    (content: string, id: number) => {
      setState((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, content } : note
        ),
      }))
    },
    [setState]
  )

  const remove = useCallback(
    (id: number) => {
      setState((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }))
    },
    [setState]
  )

  return (
    <ul className="list">
      {state.notes.map((note) => (
        <Note data={note} onEdit={edit} onRemove={remove} key={note.id} />
      ))}
    </ul>
  )
}
