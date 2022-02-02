import { useState } from 'react'

export const useListener = <TState>(initialState: TState) => {
  const [state, setState] = useState(initialState)

  const listener = (newState: TState) => {
    setState(newState)
  }

  const returnValue = {
    state,
    listener,
  }

  return Object.assign([state, listener] as const, returnValue)
}
