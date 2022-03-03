import React, { useEffect } from 'react'

import { useRemind } from 'store'
import { useForm } from './useForm'
import './form.css'

const Form = () => {
  const [values, handler] = useForm({ title: '', content: '' })
  const { setMind, unregister } = useRemind()

  useEffect(() => {
    unregister()
  }, [unregister])

  const submit = (formValues: typeof values) => {
    if (handler.isFilled()) {
      const { title, content } = formValues
      const newNote = {
        title,
        content,
        id: Math.random(),
      }

      setMind(({ notes: prevNotes }) => ({
        notes: [...prevNotes, newNote],
      }))

      handler.reset()
    }
  }

  return (
    <form onSubmit={handler.onSubmit(submit)} className="form">
      <label htmlFor="title" className="input-label">
        title
      </label>
      <input
        name="title"
        id="title"
        value={values.title}
        onChange={handler.onChange}
        autoComplete="off"
        className="text-input"
      />
      <label htmlFor="content" className="input-label">
        content
      </label>
      <input
        name="content"
        id="content"
        value={values.content}
        onChange={handler.onChange}
        autoComplete="off"
        className="text-input"
      />
      <button type="submit" className="submit-button">
        create note
      </button>
    </form>
  )
}

export { Form }
