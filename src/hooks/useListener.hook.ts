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
  callback: (nextState: TState, prevState?: TState) => TState
) => {
  const asyncSymbol = Symbol('async')

  type Mind = TState & {
    [asyncSymbol]?: AsyncSlice
  }
  let mind: Mind = callback(
    filterObject(initialState, (_, value) => !isAsyncFunction(value))
  )

  const setMind = (nextState: TState, prevState?: TState) => {
    const asyncSlice = mind[asyncSymbol]
    const updatedMind: Mind = callback(
      filterObject(nextState, (_, value) => !isAsyncFunction(value)),
      prevState &&
        filterObject(prevState, (_, value) => !isAsyncFunction(value))
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
  observer: (nextState: TState, prevState?: TState) => TState
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

  const listener = useCallback((nextState: TState, prevState?: TState) => {
    if (hasMounted.current) {
      mind.setMind(nextState, prevState)

      force()
    }
  }, [])

  return [mind.current, listener] as const
}
