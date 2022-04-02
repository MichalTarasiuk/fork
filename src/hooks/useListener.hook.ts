import { useCallback, useRef } from 'react'

import { useFirstMountState, useForce, useHasMounted, useAsync } from './hooks'
import { pickByValue, isAsyncFunction } from '../helpers/helpers'
import type { AddByValue, AsyncFunction } from './../typings/typings'
import type { Status, AsyncSlice } from './useAsync.hook'

type StateMap<TValue> = { nextState: TValue; prevState?: TValue }

export const useListener = <
  TPlainState extends Record<PropertyKey, unknown>,
  TState extends AddByValue<TPlainState, AsyncFunction, Status>
>(
  initialState: TPlainState,
  observer: (nextState: TState, state?: TState) => TState
) => {
  const state = useRef<TState | undefined>(undefined)
  const setState = useCallback(
    (stateMap: StateMap<TPlainState | TState>, asyncSlice: AsyncSlice) => {
      const { nextState, prevState } = stateMap

      state.current = observer(
        { ...nextState, ...asyncSlice } as TState,
        prevState && ({ ...prevState, ...asyncSlice } as TState)
      )
    },
    []
  )

  const force = useForce()
  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMountState()
  const asyncSlice = useAsync(
    pickByValue(state.current || initialState, isAsyncFunction) as any,
    (nextAsyncSlice, action) => {
      if (state.current) {
        setState(
          { nextState: state.current, prevState: state.current },
          nextAsyncSlice
        )

        action === 'set' && force()
      }
    }
  )

  if (isFirstMount) {
    setState({ nextState: initialState }, asyncSlice.current)
  }

  const listener = useCallback(
    (nextState: TPlainState, prevState?: TPlainState) => {
      if (hasMounted.current) {
        setState({ nextState, prevState }, asyncSlice.current)

        force()
      }
    },
    []
  )

  return [state.current!, listener] as const
}
