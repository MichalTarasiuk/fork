import { useCallback, useMemo } from 'react'

import {
  empty,
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
import type { AsyncSlice } from '../hooks/useAsync.hook'

const createMind = <TState extends Record<PropertyKey, unknown>>(
  initialState: TState,
  callback: (nextState: TState, prevState?: TState) => TState
) => {
  const asyncSymbol = Symbol('async')
  let mind = callback(omitByValue(initialState, isAsyncFunction))

  const setMind = (nextState: TState, prevState?: TState) => {
    const updatedState = callback(
      omitByValue(nextState, isAsyncFunction),
      prevState && omitByValue(prevState, isAsyncFunction)
    )

    mind = Object.assign(empty(mind), updatedState)
  }

  const updateAsync = (asyncSlice: AsyncSlice) => {
    // @ts-ignore
    mind[asyncSymbol] = asyncSlice
  }

  return {
    get value() {
      return flatObject(mind, asyncSymbol) as TState
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

      force()
    }
  }, [])

  return [mind.value, listener] as const
}
