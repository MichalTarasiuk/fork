import produce from 'immer'

import {
  createObserver,
  resolve,
  equals,
  isFunction,
  cloneObject,
  noop,
  empty,
} from './helpers/helpers'
import type { Resolvable, Listener } from './helpers/helpers'
import type {
  CreateState,
  StateCreator,
  Selector,
  SetState,
  GetState,
  CustomEquality,
  Lifecycle,
} from './store.types'

const createStore = <TState extends Record<PropertyKey, unknown>>(
  stateCreator: StateCreator<TState>,
  lifecycle?: Lifecycle<TState>
) => {
  const { onMount = () => null, onUpdate = noop } = lifecycle || {}

  let state: ReturnType<CreateState<TState>>
  const observer = createObserver<TState>()

  const customListener = <TSelector extends Selector<TState>>(
    listener: Listener<TState>,
    selector: Selector<TState>,
    customEquality?: CustomEquality<ReturnType<TSelector>>
  ) => {
    return (nextState: TState, state?: TState) => {
      const nextSlice = selector(nextState)
      const slice = state && selector(state)
      const notify = customEquality
        ? customEquality(nextSlice, slice)
        : !equals(nextSlice, slice)

      if (notify) {
        listener(nextState, state)
      }
    }
  }

  const subscribe = <TSelector extends Selector<TState>>(
    listener: Listener<TState>,
    selector?: TSelector,
    customEquality?: CustomEquality<ReturnType<TSelector>>
  ) => {
    const readydListener = selector
      ? customListener(listener, selector, customEquality)
      : listener

    const subscriber = observer.subscribe(readydListener)

    return subscriber
  }

  const setState: SetState<TState> = (patch, config, emitter) => {
    const { replace = false, emitt = true } = config || {}

    const { nextState, oldState } = state.set((state) => {
      const updatedState = produce(state, (draft) => {
        const resolvedPatch = isFunction(patch) ? patch(draft, setState) : patch

        if (resolvedPatch) {
          Object.assign(replace ? empty(draft) : draft, resolvedPatch)
        }
      })

      onUpdate(updatedState)

      return updatedState
    })

    if (!equals(nextState, oldState)) {
      observer.notify(nextState, oldState, emitt ? undefined : emitter)
    }
  }

  const getState = () => state.current

  const reset = () => {
    const restoredState = createState(stateCreator, setState, getState)
    const savedState = cloneObject(state.current)

    Object.assign(state.current, restoredState.current)
    observer.notify(restoredState.current, savedState)

    return restoredState.current
  }

  state = createState(stateCreator, setState, getState)
  state.set((state) => {
    const nextState = onMount(state)

    if (nextState) {
      return nextState
    }

    return state
  })

  return {
    get state() {
      return state.current
    },
    get listeners() {
      return observer.listeners
    },
    notify: observer.notify,
    reset,
    setState,
    subscribe,
  }
}

const createState = <TState extends Record<PropertyKey, unknown>>(
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>,
  getState: GetState<TState>
) => {
  const state = isFunction(stateCreator)
    ? stateCreator(setState, getState)
    : stateCreator

  return {
    current: state,
    set(resolvableState: Resolvable<TState>) {
      const oldState = cloneObject(this.current)
      const nextState = resolve(resolvableState, oldState)

      Object.assign(empty(this.current), nextState)

      return {
        nextState,
        oldState,
      }
    },
  }
}

export { createStore }
