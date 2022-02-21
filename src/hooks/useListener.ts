import { useState, useCallback } from 'react'

export const useListener = <TState>(
  initialState: TState,
  listener: (state: TState) => TState
) => {
  const [state, setState] = useState(listener(initialState))

  const observer = useCallback((nextState: TState) => {
    setState(listener(nextState))
  }, [])

  return [state, observer] as const
}
