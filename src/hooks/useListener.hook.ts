import { useCallback, useMemo } from 'react'

import { isAsyncFunction, flatObject, filterObject } from '../helpers/helpers'
import {
  useHasMounted,
  useForce,
  useFirstMountState,
  useAsync,
} from '../hooks/hooks'
import type { AsyncSlice, Status } from '../hooks/useAsync.hook'
import type { AddBy, AsyncFunction } from '../typings/typings'

const createMind = <TState extends Record<PropertyKey, unknown>>(
  initialState: TState,
  callback: (state: TState | undefined, nextState: TState) => TState
) => {
  const asyncSymbol = Symbol('async')

  type Mind = TState & {
    [asyncSymbol]?: AsyncSlice
  }
  let mind: Mind = callback(
    undefined,
    filterObject(initialState, (_, value) => !isAsyncFunction(value))
  )

  const setMind = (state: TState | undefined, nextState: TState) => {
    const asyncSlice = mind[asyncSymbol]
    const updatedMind: Mind = callback(
      state && filterObject(state, (_, value) => !isAsyncFunction(value)),
      filterObject(nextState, (_, value) => !isAsyncFunction(value))
    )

    updatedMind[asyncSymbol] = asyncSlice
    mind = updatedMind
  }

  const updateAsync = (asyncSlice: AsyncSlice) => {
    mind[asyncSymbol] = asyncSlice
  }

  return {
    get current() {
      type FlattenObject = AddBy<TState, AsyncFunction, Status>
      return flatObject(mind, asyncSymbol) as FlattenObject
    },
    setMind,
    updateAsync,
  }
}

export const useListener = <TState extends Record<PropertyKey, unknown>>(
  state: TState,
  observer: (state: TState | undefined, nextState: TState) => TState
) => {
  const mind = useMemo(() => createMind(state, observer), [])

  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMountState()
  const force = useForce()

  const asyncSlice = useAsync(
    filterObject(state, (_, value) => isAsyncFunction(value)) as Record<
      PropertyKey,
      AsyncFunction
    >,
    (nextAsyncSlice, action) => {
      mind.updateAsync(nextAsyncSlice)

      if (action === 'set') {
        force()
      }
    }
  )

  if (isFirstMount) {
    mind.updateAsync(asyncSlice.current)
  }

  const listener = useCallback((state: TState, nextState: TState) => {
    if (hasMounted.current) {
      mind.setMind(state, nextState)

      force()
    }
  }, [])

  return [mind.current, listener] as const
}
