import {
  createObserver,
  resolveState,
  equals,
  isFunction,
  cloneObject,
  noop,
  empty,
} from './helpers/helpers'
import type { ResolvableState, Listener } from './helpers/helpers'
import type {
  CreateState,
  StateCreator,
  Selector,
  SetState,
  GetState,
  CustomEquality,
  Lifecycle,
} from './store.types'

const mockLifecycle = {
  onMount() {
    return null
  },
  onUpdate: noop,
}

const createStore = <TState extends Record<PropertyKey, unknown>>(
  stateCreator: StateCreator<TState>,
  lifecycle: Lifecycle<TState> = mockLifecycle
) => {
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

  const setState: SetState<TState> = (patch, replace = false) => {
    const resolvedPatch = isFunction(patch)
      ? patch(state.current, setState)
      : patch

    const { nextState, oldState } = state.setState((state) => {
      const nextState = replace
        ? (resolvedPatch as TState)
        : { ...state, ...resolvedPatch }

      lifecycle.onUpdate(nextState)

      return nextState
    })

    if (!equals(nextState, oldState)) {
      observer.notify(nextState, oldState)
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
  state.setState((state) => {
    const nextState = lifecycle.onMount(state)

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
  const resolvedState = isFunction(stateCreator)
    ? stateCreator(setState, getState)
    : stateCreator

  return {
    current: resolvedState,
    setState(resolvableState: ResolvableState<TState>) {
      const oldState = cloneObject(this.current)
      const nextState = resolveState(resolvableState, oldState)

      Object.assign(empty(this.current), nextState)

      return {
        nextState,
        oldState,
      }
    },
  }
}

export { createStore }
