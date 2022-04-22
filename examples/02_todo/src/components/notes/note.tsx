import { useState, useCallback, useRef } from 'react'

import type { Note as Data } from 'store/store'
import './notes.css'

type Props = {
  data: Data
  onEdit: (content: string, id: number) => void
  onRemove: (id: number) => void
}

export const Note = ({ data, onEdit, onRemove }: Props) => {
  const [contentEditable, setContentEditable] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)

  const { title, content, id } = data

  const toggle = useCallback(() => {
    setContentEditable((prevState) => !prevState)
  }, [])

  const save = useCallback(
    (id: number) => {
      if (contentRef.current && contentRef.current.textContent) {
        setContentEditable(false)
        onEdit(contentRef.current.textContent, id)
      }
    },
    [onEdit]
  )

  return (
    <li className="list-element">
      <div className="content">
        <p>{title}</p>
        <span>&nbsp;-&nbsp;</span>
        <p ref={contentRef} contentEditable={contentEditable}>
          {content}
        </p>
      </div>
      <div>
        {contentEditable && <button onClick={() => save(id)}>save</button>}
        <button onClick={toggle}>edit</button>
        <button onClick={() => onRemove(id)}>remove</button>
      </div>
    </li>
  )
}
