import {
  createObserver,
  buildOf,
  resolveState,
  equals,
  isFunction,
  cloneObject,
  getMiddlewares,
  invokeMiddlewares,
} from './utils'
import type { ResolvableState, Listener } from './utils'
import type { DeepPartial } from './typings'
import type {
  CreateState,
  StateCreator,
  Selector,
  SetState,
} from './store.types'

const createStore = <TState>(stateCreator: StateCreator<TState>) => {
  let state: ReturnType<CreateState<TState>>
  const observer = createObserver<TState>()

  const customListener = (
    listener: Listener<TState>,
    selector: Selector<TState>
  ) => {
    return (nextState: TState, state?: TState) => {
      const nextSlice = selector(nextState)
      const slice = state && selector(state)

      !equals(nextSlice, slice) && listener(nextState, state)
    }
  }

  const subscribe = (
    listener: Listener<TState>,
    selector?: Selector<TState>
  ) => {
    const readydListener = selector
      ? customListener(listener, selector)
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

      return nextState
    })

    if (!equals(nextState, oldState)) {
      observer.notify(nextState, oldState)
    }
  }

  const reset = () => {
    const restoredState = createState(stateCreator, setState)
    const savedState = cloneObject(state.value)

    state = restoredState
    observer.notify(restoredState.value, savedState)

    return restoredState.value
  }

  state = createState(stateCreator, setState)

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
  setState: SetState<TState>
) => {
  const resolvedState = isFunction(stateCreator)
    ? stateCreator(setState)
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
