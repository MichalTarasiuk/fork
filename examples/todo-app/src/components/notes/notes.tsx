import { useState, useCallback } from 'react'

import { useRemind } from 'store'
import type { Note } from '../../store/store.types'
import './notes.css'

type Props = {
  note: Note
  onEdit: (content: string, id: number) => void
}

const Element = ({ note, onEdit }: Props) => {
  const [contentEditable, setContentEditable] = useState(false)

  const toggle = useCallback(() => {
    setContentEditable((prevState) => !prevState)
  }, [])

  const save = useCallback(
    (content: string, id: number) => {
      setContentEditable(false)
      onEdit(content, id)
    },
    [onEdit]
  )

  return (
    <li className="list-element">
      <div className="content">
        <p>{note.title}</p>
        <span>&nbsp;-&nbsp;</span>
        <p contentEditable={contentEditable}>{note.content}</p>
      </div>
      <div>
        {contentEditable && (
          <button onClick={() => save(note.content, note.id)}>save</button>
        )}
        <button onClick={toggle}>edit</button>
      </div>
    </li>
  )
}

export const Notes = () => {
  const { mind, setMind } = useRemind()

  const editHandler = useCallback(
    (content: string, id: number) => {
      setMind((mind) => ({
        notes: mind.notes.map((note) => {
          if (note.id === id) {
            return { ...note, content }
          }

          return note
        }),
      }))
    },
    [setMind]
  )

  return (
    <ul className="list">
      {mind.notes.map((note) => (
        <Element note={note} onEdit={editHandler} key={note.id} />
      ))}
    </ul>
  )
}
