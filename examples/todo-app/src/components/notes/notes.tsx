import { useState, useCallback } from 'react'

import { useRemind } from 'store/store'
import type { Note } from '../../store/store.types'
import './notes.css'

type Props = {
  note: Note
  onEdit: (content: string, id: number) => void
  onRemove: (id: number) => void
}

const Element = ({ note, onEdit, onRemove }: Props) => {
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
        <button onClick={() => onRemove(note.id)}>remove</button>
      </div>
    </li>
  )
}

export const Notes = () => {
  const { mind, setMind } = useRemind((state) => state, {
    watch: true,
  })

  const editHandler = useCallback(
    (content: string, id: number) => {
      const noteIndex = mind.notes.findIndex((note) => note.id === id)

      if (noteIndex !== -1) {
        mind.notes[noteIndex] = { ...mind.notes[noteIndex], content }
      }
    },
    [mind.notes]
  )

  const removeHandler = useCallback(
    (id: number) => {
      setMind((prevMind) => ({
        notes: prevMind.notes.filter((note) => note.id !== id),
      }))
    },
    [setMind]
  )

  return (
    <ul className="list">
      {mind.notes.map((note) => (
        <Element
          note={note}
          onEdit={editHandler}
          onRemove={removeHandler}
          key={note.id}
        />
      ))}
    </ul>
  )
}
