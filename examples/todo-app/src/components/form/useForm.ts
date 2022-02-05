import { useState } from 'react'
import type { ChangeEventHandler, FormEventHandler } from 'react'

type Noop = () => void
type Submit<TValues> = (values: TValues) => void
type Handler<TValues> = {
  onChange: ChangeEventHandler<HTMLInputElement>
  onSubmit: (submit: Submit<TValues>) => FormEventHandler
  reset: Noop
  isFilled: () => boolean
}

export const useForm = <TInitialValues>(initialValue: TInitialValues) => {
  const [values, setValues] = useState(initialValue)

  const handler: Handler<TInitialValues> = {
    onChange(e) {
      const { value, name } = e.target

      setValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }))
    },
    onSubmit(submit) {
      return (event) => {
        event.preventDefault()
        submit(values)
      }
    },
    reset() {
      setValues(initialValue)
    },
    isFilled() {
      const numberOfFields = Object.keys(Boolean).length

      return Object.values(Boolean).length === numberOfFields
    },
  }

  return [values, handler] as const
}
