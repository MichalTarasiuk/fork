import { cloneDeep } from 'lodash'
import { useCallback, useMemo } from 'react'

import {
  useHasMounted,
  useForce,
  useFirstMount,
  useMultipleMutations,
} from '../hooks/hooks'
import { isAsyncFunction, flatObject, partition } from '../utils/utils'

import type { AddBy, AsyncFunction, ArrowFunction } from '../types/types'
import type { MultipleMutations, Status } from './useMultipleMutations.hook'

type AsyncActions = Record<PropertyKey, AsyncFunction>
type SyncActions = Record<PropertyKey, ArrowFunction>

const createStore = <
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
    [asyncSymbol]?: MultipleMutations
  }

  let savedState: State = cloneDeep(initialState)
  savedState[syncSymbol] = syncActions

  const setState = (nextState: TState) => {
    const stateToSaved: State = cloneDeep(nextState)

    stateToSaved[asyncSymbol] = savedState[asyncSymbol]
    stateToSaved[syncSymbol] = savedState[syncSymbol]

    savedState = stateToSaved
  }

  const updateAsync = (multipleMutations: MultipleMutations) => {
    savedState[asyncSymbol] = multipleMutations
  }

  return {
    get state() {
      const copy = fn(cloneDeep(savedState))

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
  actions: TActions | undefined,
  fn: (state: TState) => TState
) => {
  type State = TState & AddBy<TActions, AsyncFunction, Status>

  const [asyncActions, syncActions] = useMemo(
    () => partition<AsyncActions, SyncActions>(actions || {}, isAsyncFunction),
    []
  )
  const store = useMemo(() => createStore(initialState, syncActions, fn), [])

  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMount()
  const force = useForce()

  const multipleMutations = useMultipleMutations(
    asyncActions,
    (nextMultipleMutations) => {
      store.updateAsync(nextMultipleMutations)

      force()
    }
  )

  if (isFirstMount) {
    store.updateAsync(multipleMutations)
  }

  const listener = useCallback((_: TState, nextState: TState) => {
    if (hasMounted.current) {
      store.setState(nextState)

      force()
    }
  }, [])

  return [store.state as State, listener] as const
}
