import { useRef, useCallback } from 'react'

import { useDidUpdate } from '../hooks/hooks'

export const useRefState = <TState>(
  initialState: TState,
  callback: (state: TState) => void
) => {
  const state = useRef(initialState)
  const savedCallback = useRef(callback)

  useDidUpdate(() => {
    savedCallback.current = callback
  }, callback)

  const setState = useCallback(
    (patch: Partial<Record<PropertyKey, TState[keyof TState]>>) => {
      state.current = { ...state.current, ...patch }

      savedCallback.current(state.current)

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
