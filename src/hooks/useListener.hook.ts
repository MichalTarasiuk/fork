import { cloneDeep } from 'lodash'
import { useCallback, useMemo } from 'react'

import { useHasMounted, useForce } from '../hooks/hooks'
import { flatObject } from '../utils/utils'

import type { PlainFunction, PlainObject } from '../types/types'

type Actions = Record<PropertyKey, PlainFunction>

type Lifecycles<TState extends PlainObject> = {
  readonly beforeListen: (nextState: TState) => boolean
  readonly onListen: (nextState: TState) => TState
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
  type State = TState & TActions

  const hookControl = useMemo(
    () => createLocalHookControl(initialState, actions, onListen),
    []
  )

  const hasMounted = useHasMounted()
  const force = useForce()

  const listener = useCallback((_: TState, nextState: TState) => {
    if (hasMounted.current && beforeListen(nextState)) {
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
  fn: (state: TState) => TState
) => {
  const actionsSymbol = Symbol('actions')

  type State = TState & {
    // eslint-disable-next-line functional/prefer-readonly-type -- sync symbol is mutable
    [actionsSymbol]?: TActions
  }

  let state: State = cloneDeep(initialState)
  state[actionsSymbol] = actions

  const setState = (nextState: TState) => {
    const stateToSaved: State = cloneDeep(nextState)

    stateToSaved[actionsSymbol] = state[actionsSymbol]

    state = stateToSaved
  }

  const setPlugins = (state: State) => {
    const flatten = flatObject(state, actionsSymbol) as TState

    return fn(flatten)
  }

  return {
    get state() {
      const extendedState = setPlugins(state)

      return extendedState
    },
    setState,
  }
}
