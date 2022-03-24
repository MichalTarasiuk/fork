import { useRef, useCallback } from 'react'

export const useRefState = <TState>(
  initialState: TState,
  callback: (state: TState) => void
) => {
  const state = useRef(initialState)

  const setState = useCallback(
    (nextState: Partial<Record<PropertyKey, TState[keyof TState]>>) => {
      state.current = { ...state.current, ...nextState }

      callback(state.current)
    },
    []
  )

  return [state, setState] as const
}
