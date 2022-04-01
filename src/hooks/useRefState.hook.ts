import { useRef, useCallback } from 'react'

export const useRefState = <TState>(
  initialState: TState,
  callback: (state: TState) => void
) => {
  const state = useRef(initialState)

  const setState = useCallback(
    (patch: Partial<Record<PropertyKey, TState[keyof TState]>>) => {
      state.current = { ...state.current, ...patch }

      callback(state.current)

      return state.current
    },
    []
  )

  const replaceState = useCallback((nextState: TState) => {
    state.current = nextState

    return state.current
  }, [])

  return { state, setState, replaceState }
}
