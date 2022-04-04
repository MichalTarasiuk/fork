import { useCallback, useMemo } from 'react'

import {
  pickByValue,
  isAsyncFunction,
  flatObject,
  omitByValue,
} from '../helpers/helpers'
import {
  useHasMounted,
  useForce,
  useFirstMountState,
  useAsync,
} from '../hooks/hooks'
import type { AsyncSlice, Status } from '../hooks/useAsync.hook'
import type { AddByValue, AsyncFunction } from '../typings/typings'

const createMind = <TState extends Record<PropertyKey, unknown>>(
  initialState: TState,
  callback: (nextState: TState, prevState?: TState) => TState
) => {
  const asyncSymbol = Symbol('async')
  let mind = callback(omitByValue(initialState, isAsyncFunction))

  const setMind = (nextState: TState, prevState?: TState) => {
    const updatedMind = callback(
      omitByValue(nextState, isAsyncFunction),
      prevState && omitByValue(prevState, isAsyncFunction)
    )

    mind = updatedMind
  }

  const updateAsync = (asyncSlice: AsyncSlice) => {
    // @ts-ignore
    mind[asyncSymbol] = asyncSlice
  }

  return {
    get value() {
      type FlattenObject = AddByValue<TState, AsyncFunction, Status>
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
  const force = useForce()
  const isFirstMount = useFirstMountState()
  const asyncSlice = useAsync(
    // @ts-ignore
    pickByValue(state, isAsyncFunction),
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
      mind.updateAsync(asyncSlice.current)

      force()
    }
  }, [])

  return [mind.value, listener] as const
}
