import produce from 'immer'

import {
  createObserver,
  resolve,
  equals,
  isFunction,
  copy,
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
  Equality,
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
    equality?: Equality<ReturnType<TSelector>>
  ) => {
    return (state: TState, nextState: TState) => {
      const nextSlice = selector(nextState)
      const slice = selector(state)
      const notify = equality
        ? equality(slice, nextSlice)
        : !equals(slice, nextSlice)

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

    const subscriber = observer.subscribe(readydListener)

    return subscriber
  }

  const setState: SetState<TState> = (patch, config, emitter) => {
    const { replace = false, emitt = true } = config || {}

    const { oldState, nextState } = state.set((state) => {
      const updatedState = produce(state, (draft) => {
        const resolvedPatch = isFunction(patch) ? patch(draft, setState) : patch

        if (resolvedPatch) {
          Object.assign(replace ? empty(draft) : draft, resolvedPatch)
        }
      })

      onUpdate(updatedState)

      return updatedState
    })

    if (!equals(oldState, nextState)) {
      observer.notify(oldState, nextState, emitt ? undefined : emitter)
    }
  }

  const getState = () => state.current

  const reset = () => {
    const restoredState = createState(stateCreator, setState, getState)
    const savedState = copy(state.current)

    Object.assign(state.current, restoredState.current)
    observer.notify(savedState, restoredState.current)

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
      const oldState = copy(this.current)
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
