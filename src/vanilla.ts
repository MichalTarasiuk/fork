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
  nextState: TState
  state: TState | undefined
  setState: (
    stateResolvable: StateResolvable<TState>
  ) => Omit<ReturnType<CreateManager<TState>>, 'setState'>
}
type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
type StateCreator<TState> = ((set: SetState<TState>) => TState) | TState
type Selector<TState> = (state: TState) => any

const create = <TState>(stateCreator: StateCreator<TState>) => {
  let manager: ReturnType<CreateManager<TState>>
  const observer = createObserver<TState>()

  const customListener = (
    listener: Listener<TState>,
    selector: Selector<TState>
  ) => {
    return (nextState: TState, state?: TState) => {
      const nextSlice = selector(nextState)

      if (state) {
        const slice = selector(state)

        !equals(nextSlice, slice) && listener(nextState, state)
      }
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

    return {
      unsubscribe: subscriber.unsubscribe,
    }
  }

  const setState: SetState<TState> = (patch, replace = false) => {
    const resolvedPatch = isFunction(patch) ? patch(manager.nextState) : patch

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
    const savedState = cloneObject(manager.nextState)

    manager = restoredManager
    observer.notify(restoredManager.nextState, savedState)

    return restoredManager.nextState
  }

  manager = createManager(stateCreator, setState)

  return {
    get: {
      get state() {
        return manager.nextState
      },
      get listeners() {
        return observer.listeners
      },
    },
    destroy: observer.destroy,
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

  for (const [key, middleware] of Object.entries(middlewares)) {
    const value = state && (state as any)[key]
    const nextValue = nextState && (nextState as any)[key]

    const { value: middlewareValue, next } = middleware(nextValue)
    const allow = next || !nextState

    currentState[key] = allow ? middlewareValue : value
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
  const nextState = invokeMiddlewares(middlewares, resolvedState)

  return {
    nextState,
    state: undefined,
    setState(stateResolvable: StateResolvable<TState>) {
      const previousState = cloneObject(this.nextState)
      const nextState = resolveState(stateResolvable, previousState)
      const modifiedState = invokeMiddlewares(
        middlewares,
        previousState,
        nextState
      )

      Object.assign(this.nextState, modifiedState)

      return {
        nextState: modifiedState,
        state: previousState,
      }
    },
  }
}

export { create }
export type { Patch, Selector, StateCreator, SetState }
