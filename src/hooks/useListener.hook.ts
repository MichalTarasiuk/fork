import { cloneDeep } from 'lodash'
import { useCallback, useMemo } from 'react'

import { useHasMounted, useForce } from '../hooks/hooks'

import type { PlainFunction, PlainObject } from '../types/types'

type Actions = Record<PropertyKey, PlainFunction>

type Lifecycles<TState extends PlainObject, TActions extends Actions> = {
  readonly beforeListen: (nextState: TState) => boolean
  readonly onListen: (nextState: TState & TActions) => TState
}

export const useListener = <
  TState extends PlainObject,
  TActions extends Actions,
  TLifecycles extends Lifecycles<TState, TActions>
>(
  initialState: TState,
  actions: TActions | undefined,
  lifecycles: TLifecycles
) => {
  type State = TState & TActions

  const hookControl = useMemo(
    () => createLocalHookControl(initialState, actions, lifecycles.onListen),
    []
  )

  const hasMounted = useHasMounted()
  const force = useForce()

  const listener = useCallback((_: TState, nextState: TState) => {
    if (hasMounted.current && lifecycles.beforeListen(nextState)) {
      hookControl.setState(nextState)

      force()
    }
  }, [])

  return [hookControl.state as State, listener] as const
}

const createLocalHookControl = <
  TState extends PlainObject,
  TActions extends Actions
>(
  initialState: TState,
  actions: TActions | undefined,
  fn: (state: TState & TActions) => TState
) => {
  let state = cloneDeep(initialState)

  const setState = (nextState: TState) => {
    const stateToSaved = cloneDeep(nextState)

    state = stateToSaved
  }

  const setPlugins = (state: TState) => {
    return fn(Object.assign({}, state, actions))
  }

  return {
    get state() {
      const extendedState = setPlugins(state)

      return extendedState
    },
    setState,
  }
}
