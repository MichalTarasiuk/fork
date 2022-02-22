import {
  createObserver,
  buildOf,
  resolveState,
  equals,
  isFunction,
  cloneObject,
  isMiddleware,
} from './utils'
import type { StateResolvable, Listener } from './utils'
import type { DeepPartial } from './typings'

type CreateManager<TState> = (
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  state: TState
  setState: (stateResolvable: StateResolvable<TState>) => {
    nextState: TState
    state: TState
  }
}
type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
type StateCreator<TState> = ((set: SetState<TState>) => TState) | TState
type Selector<TState> = (state: TState) => any

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

const invokeMiddlewares = <TState>(
  middlewares: TState,
  state: TState,
  nextState?: TState
): TState => {
  const currentState: any = cloneObject(nextState || state)
  const initialStateCreate = !nextState

  for (const [key, middleware] of Object.entries(middlewares)) {
    const fallbackValue = state && (state as any)[key]
    const nextValue = nextState && (nextState as any)[key]

    const { value: middlewareValue, next } = middleware(nextValue)

    currentState[key] =
      next || initialStateCreate ? middlewareValue : fallbackValue
  }

  return currentState
}

const getMiddlewares = <TState extends Record<string, any>>(state: TState) =>
  Object.fromEntries(
    Object.entries(state).filter(([, value]) => isMiddleware(value))
  ) as TState

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
export type { Patch, Selector, StateCreator, SetState }
