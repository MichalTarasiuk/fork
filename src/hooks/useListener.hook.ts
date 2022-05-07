import { cloneDeep } from 'lodash'
import { useCallback, useMemo } from 'react'

import { isAsyncFunction, flatObject, split } from '../helpers/helpers'
import {
  useHasMounted,
  useForce,
  useFirstMount,
  useAsync,
} from '../hooks/hooks'

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
  fn: (state: TState | undefined, nextState: TState) => TState
) => {
  const asyncSymbol = Symbol('async')
  const syncSymbol = Symbol('sync')

  type State = TState & {
    // eslint-disable-next-line functional/prefer-readonly-type -- sync symbol is mutable
    [syncSymbol]?: TSyncActions
    // eslint-disable-next-line functional/prefer-readonly-type -- async symbol is mutable
    [asyncSymbol]?: AsyncSlice
  }

  let savedState: State = fn(undefined, cloneDeep(initialState))
  savedState[syncSymbol] = syncActions

  const setState = (state: TState | undefined, nextState: TState) => {
    const stateToSaved: State = fn(cloneDeep(state), cloneDeep(nextState))

    stateToSaved[asyncSymbol] = savedState[asyncSymbol]
    stateToSaved[syncSymbol] = savedState[syncSymbol]

    savedState = stateToSaved
  }

  const updateAsync = (asyncSlice: AsyncSlice) => {
    savedState[asyncSymbol] = asyncSlice
  }

  return {
    get state() {
      return flatObject(savedState, asyncSymbol, syncSymbol)
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
  fn: (state: TState | undefined, nextState: TState) => TState
) => {
  type State = AddBy<TState & TActions, AsyncFunction, Status>

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

  const listener = useCallback((state: TState, nextState: TState) => {
    if (hasMounted.current) {
      manager.setState(state, nextState)

      force()
    }
  }, [])

  return [manager.state as State, listener] as const
}
