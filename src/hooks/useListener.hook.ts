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

type LifeCycles<TState extends Record<PropertyKey, unknown>> = {
  readonly beforeListen: (nextState: TState) => boolean
  readonly onListen: (nextState: TState) => TState
}

const createHookState = <
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
      const flatten = flatObject(savedState, mutationsSymbol, syncActionsSymbol)

      return fn(flatten)
    },
    setState,
    updateMutations,
  }
}

export const useListener = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, Function>,
  TLifeCycles extends LifeCycles<TState>
>(
  initialState: TState,
  actions: TActions | undefined,
  { onListen, beforeListen }: TLifeCycles
) => {
  type State = TState & AddBy<TActions, AsyncFunction, Status>

  const [asyncActions, syncActions] = useMemo(
    () => partition<AsyncActions, SyncActions>(actions || {}, isAsyncFunction),
    []
  )
  const hookState = useMemo(
    () => createHookState(initialState, syncActions, onListen),
    []
  )

  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMount()
  const force = useForce()

  const mutations = useAsync(asyncActions, (nextMutations) => {
    hookState.updateMutations(nextMutations)

    force()
  })

  if (isFirstMount) {
    hookState.updateMutations(mutations)
  }

  const listener = useCallback((_: TState, nextState: TState) => {
    if (hasMounted.current && beforeListen(nextState)) {
      hookState.setState(nextState)

      force()
    }
  }, [])

  return [hookState.current as State, listener] as const
}
