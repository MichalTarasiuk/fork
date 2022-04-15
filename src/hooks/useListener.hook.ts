import { useCallback, useMemo } from 'react'

import { useTabIndex } from '../factory'
import {
  pickByValue,
  isAsyncFunction,
  flatObject,
  omitByValue,
  equals,
  cloneObject,
} from '../helpers/helpers'
import {
  useHasMounted,
  useForce,
  useFirstMountState,
  useAsync,
  usePrevious,
} from '../hooks/hooks'
import { SHOULD_UPDATE_COMPONENT } from '../constants'
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
  let mind: Mind = callback(omitByValue(initialState, isAsyncFunction))

  const setMind = (nextState: TState, prevState?: TState) => {
    const asyncSlice = mind[asyncSymbol]
    const updatedMind: Mind = callback(
      omitByValue(nextState, isAsyncFunction),
      prevState && omitByValue(prevState, isAsyncFunction)
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
  const previousState = usePrevious(cloneObject(state))

  const asyncSlice = useAsync(
    pickByValue<Record<PropertyKey, AsyncFunction>>(state, isAsyncFunction),
    (nextAsyncSlice, action) => {
      mind.updateAsync(nextAsyncSlice)

      if (action === 'set') {
        force()
      }
    }
  )

  useTabIndex((tabIndex) => {
    // const cachedState = stash.read()

    if (tabIndex === SHOULD_UPDATE_COMPONENT) {
      // mind.setMind(cachedState)
      // force()
    }
  })

  if (isFirstMount) {
    mind.updateAsync(asyncSlice.current)
  } else if (!equals(state, previousState)) {
    mind.setMind(state, previousState)
  }

  const listener = useCallback((nextState: TState, prevState?: TState) => {
    if (hasMounted.current) {
      mind.setMind(nextState, prevState)

      force()
    }
  }, [])

  return [mind.current, listener] as const
}
