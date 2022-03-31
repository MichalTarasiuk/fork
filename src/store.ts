import {
  createObserver,
  resolveState,
  equals,
  isFunction,
  cloneObject,
  noop,
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

const createStore = <TState>(
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
      ? patch(state.value, setState)
      : patch

    const { nextState, oldState } = state.setState((state) => {
      const nextState = replace
        ? (patch as TState)
        : { ...state, ...resolvedPatch }

      lifecycle.onUpdate(nextState)

      return nextState
    })

    if (!equals(nextState, oldState)) {
      observer.notify(nextState, oldState)
    }
  }

  const getState = () => state.value

  const reset = () => {
    const restoredState = createState(stateCreator, setState, getState)
    const savedState = cloneObject(state.value)

    Object.assign(state.value, restoredState.value)
    observer.notify(restoredState.value, savedState)

    return restoredState.value
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
      return state.value
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

const createState = <TState>(
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>,
  getState: GetState<TState>
) => {
  const resolvedState = isFunction(stateCreator)
    ? stateCreator(setState, getState)
    : stateCreator

  return {
    value: resolvedState,
    setState(resolvableState: ResolvableState<TState>) {
      const oldState = cloneObject(this.value)
      const nextState = resolveState(resolvableState, oldState)

      Object.assign(this.value, nextState)

      return {
        nextState,
        oldState,
      }
    },
  }
}

export { createStore }
