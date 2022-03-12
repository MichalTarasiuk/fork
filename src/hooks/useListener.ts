import { useCallback, useRef } from 'react'

import {
  useFirstMountState,
  useForce,
  useIsMounted,
  useMultipleFetch,
} from '../hooks'
import { deepPickAsyncFunctions, buildOf } from '../utils'

export const useListener = <TState>(
  initialState: TState,
  listener: (nextState: TState, state?: TState) => TState
) => {
  const force = useForce()
  const component = useIsMounted()
  const isFirstMount = useFirstMountState()
  const multipleFetch = useMultipleFetch<TState>(
    deepPickAsyncFunctions(initialState)
  )

  const state = useRef<TState | undefined>(undefined)

  if (isFirstMount) {
    state.current = listener(buildOf(initialState, multipleFetch))
  }

  const observer = useCallback(
    (nextState: TState, prevState?: TState) => {
      if (component.isMounted) {
        state.current = listener(
          buildOf(nextState, multipleFetch),
          prevState && buildOf(prevState, multipleFetch)
        )

        force()
      }
    },
    [multipleFetch]
  )

  return [state.current as unknown as TState, observer] as const
}
