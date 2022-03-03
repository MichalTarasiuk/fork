import { useCallback, useRef } from 'react'

import { useFirstMountState } from './useFirstMountState'
import { useForce } from './useForce'

export const useListener = <TState>(
  initialState: TState,
  listener: (nextState: TState, state?: TState) => TState
) => {
  const force = useForce()

  const state = useRef<TState | undefined>(undefined)
  const isFirstMount = useFirstMountState()

  if (isFirstMount) {
    state.current = listener(initialState)
  }

  const observer = useCallback((nextState: TState, prevState?: TState) => {
    state.current = listener(nextState, prevState)
    force()
  }, [])

  return [state.current as unknown as TState, observer] as const
}
