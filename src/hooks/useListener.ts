import { useState } from 'react'

export const useListener = <TState>(initialState: TState) => {
  const [state, setState] = useState(initialState)

  const listener = (newState: TState) => {
    setState(newState)
  }

  return [state, listener] as const
}
