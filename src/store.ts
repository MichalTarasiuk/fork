import Produce from 'immer'
import { cloneDeep, isEqual } from 'lodash'

import { createEventEmitter, resolve, empty } from './utils/utils'

import type {
  ActionsCreator,
  Selector,
  SetState,
  Equality,
  ResolvableState,
  SetConfig,
  Patch,
} from './store.types'
import type { ArrowFunction } from './types/types'
import type { Listener } from './utils/utils'

const createStore = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, ArrowFunction>
>(
  initialState: TState,
  actionsCreator?: ActionsCreator<TState, TActions>
) => {
  const state = createState(initialState)
  const eventEmitter = createEventEmitter<TState>()

  const customListener = <TSelector extends Selector<TState>>(
    listener: Listener<TState>,
    selector: TSelector,
    equality?: Equality<ReturnType<TSelector>>
  ) => {
    return (state: TState, nextState: TState) => {
      const nextSlice = selector(nextState)
      const slice = selector(state)
      const notify = equality
        ? // @ts-ignore
          equality(slice, nextSlice)
        : !isEqual(slice, nextSlice)

      if (notify) {
        listener(state, nextState)
      }
    }
  }

  const subscribe = <TSelector extends Selector<TState>>(
    listener: Listener<TState>,
    selector?: TSelector,
    equality?: Equality<ReturnType<TSelector>>
  ) => {
    const readydListener = selector
      ? customListener(listener, selector, equality)
      : listener
    const subscriber = eventEmitter.subscribe(readydListener)
    const customSetState = (patch: Patch<TState>, config?: SetConfig) => {
      setState(patch, config, subscriber.body)
    }
    const actions = resolve(actionsCreator, customSetState, getState)

    return { actions, ...subscriber }
  }

  const setState: SetState<TState> = (patch, config, emitter) => {
    const { replace = false, emitt = true } = config || {}

    const { oldState, nextState } = state.set((state) => {
      const updatedState = Produce(state, (draft) => {
        const resolvedPatch = resolve(patch, draft, setState)

        if (resolvedPatch) {
          Object.assign(replace ? empty(draft) : draft, resolvedPatch)
        }
      })

      return updatedState
    })

    if (!isEqual(oldState, nextState)) {
      eventEmitter.notify(oldState, nextState, emitt ? undefined : emitter)
    }
  }

  const getState = () => state.current

  return {
    state: state.current,
    notify: eventEmitter.notify,
    get listeners() {
      return eventEmitter.listeners
    },
    setState,
    subscribe,
  }
}

const createState = <TState extends Record<PropertyKey, unknown>>(
  initialState: TState
) => {
  const state = {
    current: initialState,
    set(resolvableState: ResolvableState<TState>) {
      const oldState = cloneDeep(state.current)
      const nextState = resolve(resolvableState, oldState)

      Object.assign(empty(state.current), nextState)

      return {
        oldState,
        nextState,
      }
    },
  }

  return state
}

export { createStore }
