import { useState, useCallback } from 'react'

export const useListener = <TState>(initialState: TState) => {
  const [state, setState] = useState(initialState)

  const listener = useCallback((nextState: TState) => {
    setState(nextState)
  }, [])

  return [state, listener] as const
}
