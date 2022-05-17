import { useRef, useCallback } from 'react'

import { useUpdate } from './hooks'

export const usePatch = <TState>(
  initialState: TState,
  fn: (state: TState) => void
) => {
  const state = useRef(initialState)
  const savedFn = useRef(fn)

  useUpdate(() => {
    savedFn.current = fn
  }, fn)

  const setState = useCallback(
    (patch: Partial<Record<PropertyKey, TState[keyof TState]>>) => {
      state.current = Object.assign(state.current, patch)

      savedFn.current(state.current)

      return state.current
    },
    []
  )

  return { state, setState }
}
