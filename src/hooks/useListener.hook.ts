import { cloneDeep } from 'lodash'
import { useCallback, useMemo } from 'react'

import {
  useHasMounted,
  useForce,
  useFirstMount,
  useMutations,
} from '../hooks/hooks'
import { isAsyncFunction, flatObject, partition } from '../utils/utils'

import type {
  AddBy,
  AsyncFunction,
  PlainFunction,
  PlainObject,
} from '../types/types'
import type { Mutations, Status } from './useMutations.hook'

type AsyncActions = Record<PropertyKey, AsyncFunction>
type SyncActions = Record<PropertyKey, PlainFunction>

type Lifecycles<TState extends PlainObject> = {
  readonly beforeListen: (nextState: TState) => boolean
  readonly onListen: (nextState: TState) => TState
}

const createLocalHookControl = <
  TState extends PlainObject,
  TSyncActions extends SyncActions
>(
  initialState: TState,
  syncActions: TSyncActions,
  fn: (state: TState) => TState
) => {
  const syncActionsSymbol = Symbol('sync')
  const asyncActionsSymbol = Symbol('async')

  type State = TState & {
    // eslint-disable-next-line functional/prefer-readonly-type -- sync symbol is mutable
    [syncActionsSymbol]?: TSyncActions
    // eslint-disable-next-line functional/prefer-readonly-type -- async symbol is mutable
    [asyncActionsSymbol]?: Mutations
  }

  let state: State = cloneDeep(initialState)
  state[syncActionsSymbol] = syncActions

  const setState = (nextState: TState) => {
    const stateToSaved: State = cloneDeep(nextState)

    stateToSaved[asyncActionsSymbol] = state[asyncActionsSymbol]
    stateToSaved[syncActionsSymbol] = state[syncActionsSymbol]

    state = stateToSaved
  }

  const updateMutations = (mutations: Mutations) => {
    state[asyncActionsSymbol] = mutations
  }

  const setPlugins = (state: State) => {
    const flatten = flatObject(state, asyncActionsSymbol, syncActionsSymbol)

    return fn(flatten)
  }

  return {
    get state() {
      const extendedState = setPlugins(state)

      return extendedState
    },
    setState,
    updateMutations,
  }
}

export const useListener = <
  TState extends PlainObject,
  TActions extends Record<PropertyKey, PlainFunction>,
  TLifecycles extends Lifecycles<TState>
>(
  initialState: TState,
  actions: TActions | undefined,
  { onListen, beforeListen }: TLifecycles
) => {
  type State = TState & AddBy<TActions, AsyncFunction, Status>

  const [asyncActions, syncActions] = useMemo(
    () => partition<AsyncActions, SyncActions>(actions || {}, isAsyncFunction),
    []
  )
  const hookControl = useMemo(
    () => createLocalHookControl(initialState, syncActions, onListen),
    []
  )

  const hasMounted = useHasMounted()
  const isFirstMount = useFirstMount()
  const force = useForce()

  const mutations = useMutations(asyncActions, (nextMutations) => {
    hookControl.updateMutations(nextMutations)

    force()
  })

  if (isFirstMount) {
    hookControl.updateMutations(mutations)
  }

  const listener = useCallback((_: TState, nextState: TState) => {
    if (hasMounted.current && beforeListen(nextState)) {
      hookControl.setState(nextState)

      force()
    }
  }, [])

  return [hookControl.state as State, listener] as const
}
