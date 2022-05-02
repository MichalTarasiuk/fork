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
import type { AddBy, AsyncFunction } from '../types/types'

type AsyncActions = Record<PropertyKey, AsyncFunction>
type SyncActions = Record<PropertyKey, Function>

const createMind = <
  TState extends Record<PropertyKey, unknown>,
  TSyncActions extends SyncActions
>(
  initialState: TState,
  syncActions: TSyncActions,
  fn: (state: TState | undefined, nextState: TState) => TState
) => {
  const asyncSymbol = Symbol('async')
  const syncSymbol = Symbol('sync')

  type Mind = TState & {
    // eslint-disable-next-line functional/prefer-readonly-type -- sync symbol is mutable
    [syncSymbol]?: TSyncActions
    // eslint-disable-next-line functional/prefer-readonly-type -- async symbol is mutable
    [asyncSymbol]?: AsyncSlice
  }
  let mind: Mind = fn(undefined, cloneDeep(initialState))
  mind[syncSymbol] = syncActions

  const setMind = (state: TState | undefined, nextState: TState) => {
    const nextMind: Mind = fn(cloneDeep(state), cloneDeep(nextState))

    nextMind[asyncSymbol] = mind[asyncSymbol]
    nextMind[syncSymbol] = mind[syncSymbol]

    mind = nextMind
  }

  const updateAsync = (asyncSlice: AsyncSlice) => {
    mind[asyncSymbol] = asyncSlice
  }

  return {
    get current() {
      return flatObject(mind, asyncSymbol, syncSymbol)
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
  fn: (state: TState | undefined, nextState: TState) => TState
) => {
  type Mind = AddBy<TState & TActions, AsyncFunction, Status>

  const [asyncActions, syncActions] = useMemo(
    () => split<AsyncActions, SyncActions>(actions, isAsyncFunction),
    []
  )
  const mind = useMemo(() => createMind(initialState, syncActions, fn), [])

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
