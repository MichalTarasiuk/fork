import { useCallback, useRef } from 'react'

import { equals } from '../utils'
import type { DeepReplace, AsyncFunction } from '../types'

import {
  useFirstMountState,
  useForce,
  useIsMounted,
  useMultipleFetch,
} from '../hooks'
import type { Status } from '../hooks/useMultipleFetch'
import { deepPickAsyncFunctions, buildOf } from '../utils'

type ModifiedState<TState> = DeepReplace<
  TState,
  AsyncFunction,
  [AsyncFunction, Status]
>

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
  const savedMultipleFetch = useRef(multipleFetch)

  const state = useRef<TState | undefined>(undefined)

  if (isFirstMount) {
    state.current = listener(
      buildOf(initialState, multipleFetch as unknown as TState)
    )
  }

  if (state.current && !equals(savedMultipleFetch.current, multipleFetch)) {
    state.current = listener(
      buildOf(state.current, multipleFetch as unknown as TState)
    )

    savedMultipleFetch.current = multipleFetch
    force()
  }

  const observer = useCallback(
    (nextState: TState, prevState?: TState) => {
      if (component.isMounted) {
        state.current = listener(
          buildOf(nextState, multipleFetch as unknown as TState),
          prevState && buildOf(prevState, multipleFetch as unknown as TState)
        )

        force()
      }
    },
    [multipleFetch]
  )

  return [state.current as unknown as ModifiedState<TState>, observer] as const
}
