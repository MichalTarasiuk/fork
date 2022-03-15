import {
  createObserver,
  buildOf,
  resolveState,
  equals,
  isFunction,
  cloneObject,
  getMiddlewares,
  invokeMiddlewares,
  noop,
} from './helpers/helpers'
import type { ResolvableState, Listener } from './helpers/helpers'
import type { DeepPartial } from './typings'
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
    const resolvedPatch = isFunction(patch) ? patch(state.value) : patch

    const { nextState, oldState } = state.setState((state) => {
      const nextState = replace
        ? (patch as TState)
        : buildOf(state, resolvedPatch as DeepPartial<TState>)

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

    state = restoredState
    observer.notify(restoredState.value, savedState)

    return restoredState.value
  }

  state = createState(stateCreator, setState, getState)
  state.setState((state) => {
    const nextState = lifecycle.onMount()

    if (nextState) {
      return nextState
    }

    return state
  })

  return {
    get: {
      get state() {
        return state.value
      },
      get listeners() {
        return observer.listeners
      },
    },
    destroy: observer.destroy,
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
  const middlewares = getMiddlewares(resolvedState)
  const initialState = invokeMiddlewares(middlewares, resolvedState)

  return {
    value: initialState,
    setState(resolvableState: ResolvableState<TState>) {
      const previousState = cloneObject(this.value)
      const resolvedState = resolveState(resolvableState, previousState)
      const nextState = invokeMiddlewares(
        middlewares,
        previousState,
        resolvedState
      )

      Object.assign(this.value, nextState)

      return {
        nextState,
        oldState: previousState,
      }
    },
  }
}

export { createStore }
