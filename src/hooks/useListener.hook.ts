import { useCallback, useRef } from 'react'

import { equals, deepPickAsyncFunctions, buildOf } from '../helpers/helpers'
import type { DeepAddByValue, AsyncFunction } from '../typings'

import { useFirstMountState, useForce, useIsMounted, useAsync } from './hooks'
import type { Status } from './useAsync.hook'

type ModifiedState<TState> = DeepAddByValue<TState, AsyncFunction, Status>

export const useListener = <TState>(
  initialState: TState,
  listener: (nextState: TState, state?: TState) => TState
) => {
  const force = useForce()
  const component = useIsMounted()
  const isFirstMount = useFirstMountState()

  const state = useRef<TState | undefined>(undefined)
  const asyncSliceState = useAsync<TState>(
    deepPickAsyncFunctions(state.current || initialState)
  )
  const savedAyncSliceState = useRef(asyncSliceState)

  if (isFirstMount) {
    state.current = listener(
      buildOf(initialState, asyncSliceState as unknown as TState)
    )
  }

  if (state.current && !equals(savedAyncSliceState.current, asyncSliceState)) {
    state.current = listener(
      buildOf(state.current, asyncSliceState as unknown as TState)
    )

    savedAyncSliceState.current = asyncSliceState
    force()
  }

  const observer = useCallback(
    (nextState: TState, prevState?: TState) => {
      if (component.isMounted) {
        state.current = listener(
          buildOf(nextState, asyncSliceState as unknown as TState),
          prevState && buildOf(prevState, asyncSliceState as unknown as TState)
        )

        force()
      }
    },
    [asyncSliceState]
  )

  return [state.current as unknown as ModifiedState<TState>, observer] as const
}
