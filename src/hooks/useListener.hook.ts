import { useCallback, useRef } from 'react'

import { useFirstMountState, useForce, useHasMounted, useAsync } from './hooks'
import { pickByValue, isAsyncFunction } from '../helpers/helpers'
import type { AddByValue, AsyncFunction } from './../typings/typings'
import type { Status } from './useAsync.hook'

export const useListener = <
  TPlainState extends Record<PropertyKey, unknown>,
  TState extends AddByValue<TPlainState, AsyncFunction, Status>
>(
  initialState: TPlainState,
  observer: (nextState: TState, state?: TState) => TState
) => {
  const state = useRef<TState | undefined>(undefined)
  const setState = useCallback(
    (nextState: TPlainState, prevState?: TPlainState) => {
      state.current = observer(
        { ...nextState, ...asyncSlice.current } as TState,
        prevState && ({ ...prevState, ...asyncSlice.current } as TState)
      )
    },
    []
  )

  const force = useForce()
  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMountState()
  const asyncSlice = useAsync(
    pickByValue(initialState, isAsyncFunction) as any,
    (nextAsyncSlice) => {
      if (state.current) {
        const nextState = { ...state.current, ...nextAsyncSlice }

        state.current = observer(nextState, state.current)

        force()
      }
    }
  )

  if (isFirstMount) {
    setState(initialState)
  }

  const syncedState = { ...state.current, ...asyncSlice.current } as TState
  const listener = useCallback(
    (nextState: TPlainState, prevState?: TPlainState) => {
      if (hasMounted.current) {
        setState(nextState, prevState)

        force()
      }
    },
    []
  )

  return [syncedState, listener] as const
}
