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
import type { StateResolvable, Listener } from './utils'
import type { DeepPartial } from './typings'
import type {
  CreateManager,
  StateCreator,
  Selector,
  SetState,
} from './store.types'

const createStore = <TState>(stateCreator: StateCreator<TState>) => {
  let manager: ReturnType<CreateManager<TState>>
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
    const resolvedPatch = isFunction(patch) ? patch(manager.state) : patch

    const { nextState, state } = manager.setState((state) => {
      const nextState = replace
        ? (patch as TState)
        : buildOf(state, resolvedPatch as DeepPartial<TState>)

      return nextState
    })

    if (!equals(nextState, state)) {
      observer.notify(nextState, state)
    }
  }

  const reset = () => {
    const restoredManager = createManager(stateCreator, setState)
    const savedState = cloneObject(manager.state)

    manager = restoredManager
    observer.notify(restoredManager.state, savedState)

    return restoredManager.state
  }

  manager = createManager(stateCreator, setState)

  return {
    get: {
      get state() {
        return manager.state
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

const createManager = <TState>(
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  const resolvedState = isFunction(stateCreator)
    ? stateCreator(setState)
    : stateCreator
  const middlewares = getMiddlewares(resolvedState)
  const initialState = invokeMiddlewares(middlewares, resolvedState)

  return {
    state: initialState,
    setState(stateResolvable: StateResolvable<TState>) {
      const previousState = cloneObject(this.state)
      const resolvedState = resolveState(stateResolvable, previousState)
      const nextState = invokeMiddlewares(
        middlewares,
        previousState,
        resolvedState
      )

      Object.assign(this.state, nextState)

      return {
        nextState,
        state: previousState,
      }
    },
  }
}

export { createStore }
