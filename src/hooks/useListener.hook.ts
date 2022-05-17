import { cloneDeep } from 'lodash'
import { useCallback, useMemo } from 'react'

import {
  useHasMounted,
  useForce,
  useFirstMount,
  useAsync,
} from '../hooks/hooks'
import { isAsyncFunction, flatObject, split } from '../utils/utils'

import type { AsyncSlice, Status } from '../hooks/useAsync.hook'
import type { AddBy, AsyncFunction, ArrowFunction } from '../types/types'

type AsyncActions = Record<PropertyKey, AsyncFunction>
type SyncActions = Record<PropertyKey, ArrowFunction>

const createManager = <
  TState extends Record<PropertyKey, unknown>,
  TSyncActions extends SyncActions
>(
  initialState: TState,
  syncActions: TSyncActions,
  fn: (state: TState) => TState
) => {
  const asyncSymbol = Symbol('async')
  const syncSymbol = Symbol('sync')

  type State = TState & {
    // eslint-disable-next-line functional/prefer-readonly-type -- sync symbol is mutable
    [syncSymbol]?: TSyncActions
    // eslint-disable-next-line functional/prefer-readonly-type -- async symbol is mutable
    [asyncSymbol]?: AsyncSlice
  }

  let savedState: State = cloneDeep(initialState)
  savedState[syncSymbol] = syncActions

  const setState = (nextState: TState) => {
    const stateToSaved: State = cloneDeep(nextState)

    stateToSaved[asyncSymbol] = savedState[asyncSymbol]
    stateToSaved[syncSymbol] = savedState[syncSymbol]

    savedState = stateToSaved
  }

  const updateAsync = (asyncSlice: AsyncSlice) => {
    savedState[asyncSymbol] = asyncSlice
  }

  return {
    get state() {
      const copy = fn(cloneDeep(savedState))

      // FIX ME: Proxy doesn't work - reference is lost
      return flatObject(copy, asyncSymbol, syncSymbol)
    },
    setState,
    updateAsync,
  }
}

export const useListener = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, Function>
>(
  initialState: TState,
  actions: TActions,
  fn: (state: TState) => TState
) => {
  type State = TState & AddBy<TActions, AsyncFunction, Status>

  const [asyncActions, syncActions] = useMemo(
    () => split<AsyncActions, SyncActions>(actions, isAsyncFunction),
    []
  )
  const manager = useMemo(
    () => createManager(initialState, syncActions, fn),
    []
  )

  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMount()
  const force = useForce()

  const asyncSlice = useAsync(asyncActions, (nextAsyncSlice) => {
    manager.updateAsync(nextAsyncSlice)

    force()
  })

  if (isFirstMount) {
    manager.updateAsync(asyncSlice.current)
  }

  const listener = useCallback((_: TState, nextState: TState) => {
    if (hasMounted.current) {
      manager.setState(nextState)

      force()
    }
  }, [])

  return [manager.state as State, listener] as const
}
