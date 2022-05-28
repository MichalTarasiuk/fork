import { cloneDeep } from 'lodash'
import { useCallback, useMemo } from 'react'

import {
  useHasMounted,
  useForce,
  useFirstMount,
  useAsync,
} from '../hooks/hooks'
import { isAsyncFunction, flatObject, partition } from '../utils/utils'

import type { AddBy, AsyncFunction, ArrowFunction } from '../types/types'
import type { Mutations, Status } from './useAsync.hook'

type AsyncActions = Record<PropertyKey, AsyncFunction>
type SyncActions = Record<PropertyKey, ArrowFunction>

const createState = <
  TState extends Record<PropertyKey, unknown>,
  TSyncActions extends SyncActions
>(
  initialState: TState,
  syncActions: TSyncActions,
  fn: (state: TState) => TState
) => {
  const syncActionsSymbol = Symbol('sync')
  const mutationsSymbol = Symbol('mutations')

  type State = TState & {
    // eslint-disable-next-line functional/prefer-readonly-type -- sync symbol is mutable
    [syncActionsSymbol]?: TSyncActions
    // eslint-disable-next-line functional/prefer-readonly-type -- async symbol is mutable
    [mutationsSymbol]?: Mutations
  }

  let savedState: State = cloneDeep(initialState)
  savedState[syncActionsSymbol] = syncActions

  const setState = (nextState: TState) => {
    const stateToSaved: State = cloneDeep(nextState)

    stateToSaved[mutationsSymbol] = savedState[mutationsSymbol]
    stateToSaved[syncActionsSymbol] = savedState[syncActionsSymbol]

    savedState = stateToSaved
  }

  const updateMutations = (mutations: Mutations) => {
    savedState[mutationsSymbol] = mutations
  }

  return {
    get current() {
      const copy = fn(cloneDeep(savedState))

      return flatObject(copy, mutationsSymbol, syncActionsSymbol)
    },
    setState,
    updateMutations,
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
  const state = useMemo(() => createState(initialState, syncActions, fn), [])

  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMount()
  const force = useForce()

  const mutations = useAsync(asyncActions, (nextMutations) => {
    state.updateMutations(nextMutations)

    force()
  })

  if (isFirstMount) {
    state.updateMutations(mutations)
  }

  const listener = useCallback((_: TState, nextState: TState) => {
    if (hasMounted.current) {
      state.setState(nextState)

      force()
    }
  }, [])

  return [state.current as State, listener] as const
}
