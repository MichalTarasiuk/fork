import { useCallback, useMemo } from 'react'

import { isAsyncFunction, flatObject, split, copy } from '../helpers/helpers'
import {
  useHasMounted,
  useForce,
  useFirstMount,
  useAsync,
} from '../hooks/hooks'
import type { AsyncSlice, Status } from '../hooks/useAsync.hook'
import type { AddBy, AsyncFunction } from '../types/types'

type AsyncActions = Record<PropertyKey, AsyncFunction>
type SyncActions = Record<PropertyKey, Function>

const createMind = <
  TState extends Record<PropertyKey, unknown>,
  TSyncActions extends SyncActions
>(
  initialState: TState,
  syncActions: TSyncActions,
  callback: (state: TState | undefined, nextState: TState) => TState
) => {
  const asyncSymbol = Symbol('async')
  const syncSymbol = Symbol('sync')

  type Mind = TState & {
    [syncSymbol]?: TSyncActions
    [asyncSymbol]?: AsyncSlice
  }
  let mind: Mind = callback(undefined, copy(initialState))
  mind[syncSymbol] = syncActions

  const setMind = (state: TState | undefined, nextState: TState) => {
    const nextMind: Mind = callback(copy(state), copy(nextState))

    nextMind[asyncSymbol] = mind[asyncSymbol]
    nextMind[syncSymbol] = mind[syncSymbol]

    mind = nextMind
  }

  const updateAsync = (asyncSlice: AsyncSlice) => {
    mind[asyncSymbol] = asyncSlice
  }

  return {
    get current() {
      return flatObject(flatObject(mind, syncSymbol), asyncSymbol)
    },
    setMind,
    updateAsync,
  }
}

export const useListener = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, Function>
>(
  initialState: TState,
  actions: TActions,
  observer: (state: TState | undefined, nextState: TState) => TState
) => {
  type Mind = AddBy<TState & TActions, AsyncFunction, Status>

  const [asyncActions, syncActions] = useMemo(
    () => split<AsyncActions, SyncActions>(actions, isAsyncFunction),
    []
  )
  const mind = useMemo(
    () => createMind(initialState, syncActions, observer),
    []
  )

  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMount()
  const force = useForce()

  const asyncSlice = useAsync(asyncActions, (nextAsyncSlice) => {
    mind.updateAsync(nextAsyncSlice)

    force()
  })

  if (isFirstMount) {
    mind.updateAsync(asyncSlice.current)
  }

  const listener = useCallback((state: TState, nextState: TState) => {
    if (hasMounted.current) {
      mind.setMind(state, nextState)

      force()
    }
  }, [])

  return [mind.current as Mind, listener] as const
}
