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

type SetUpStore<TState> = (
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  state: TState
  prevState: TState | undefined
  setState: (
    stateResolvable: StateResolvable<TState>
  ) => ReturnType<SetUpStore<TState>>
}
type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
type StateCreator<TState> = ((set: SetState<TState>) => TState) | TState
type Selector<TState> = (state: TState) => any

const create = <TState>(stateCreator: StateCreator<TState>) => {
  let store: ReturnType<SetUpStore<TState>>
  const observer = createObserver<TState>()

  const customListener = (
    listener: Listener<TState>,
    selector: Selector<TState>
  ) => {
    return (newState: TState, prevState?: TState) => {
      const newSlice = selector(newState)

      if (prevState) {
        const oldSlice = selector(prevState)

        !equals(newSlice, oldSlice) && listener(newState, prevState)
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
    const resolvedPatch = isFunction(patch) ? patch(store.state) : patch

    const { state: newState, prevState } = store.setState((prevState) => {
      const newState = replace
        ? (patch as TState)
        : buildOf(prevState, resolvedPatch as DeepPartial<TState>)

      return newState
    })

    if (!equals(newState, prevState)) {
      observer.notify(newState, prevState)
    }
  }

  const destroy = () => observer.destroy()

  const reset = () => {
    const restoredStore = setUpStore(stateCreator, setState)
    const prevState = store.state
    const restoredState = restoredStore.state
    store = restoredStore

    observer.notify(restoredState, prevState)

    return restoredState
  }

  const initializedStore = setUpStore(stateCreator, setState)
  store = initializedStore

  return {
    get: {
      get state() {
        return store.state
      },
      get listeners() {
        return observer.listeners
      },
    },
    reset,
    setState,
    destroy,
    subscribe,
  }
}

const invokeMiddlewares = <TState>(
  middlewares: TState,
  state: TState,
  nextState?: TState
): TState => {
  const cloneState: any = cloneObject(nextState || state)
  const initialStateCreation = !nextState

  Object.entries(middlewares).forEach(([key, middleware]) => {
    const value = state && (state as any)[key]
    const nextValue = nextState && (nextState as any)[key]

    const { value: middlewareValue, next } = middleware(nextValue)
    const condition = next || initialStateCreation

    cloneState[key] = condition ? middlewareValue : value
  })

  return cloneState
}

const getMiddlewares = <TState extends Record<string, any>>(state: TState) =>
  Object.fromEntries(
    Object.entries(state).filter(([, value]) => isMiddleware(value))
  ) as TState

const setUpStore = <TState>(
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  const resolvedState = isFunction(stateCreator)
    ? stateCreator(setState)
    : stateCreator
  const middlewares = getMiddlewares(resolvedState)
  const state = invokeMiddlewares(middlewares, resolvedState)

  const handler = {
    state,
    prevState: undefined,
    setState(stateResolvable: StateResolvable<TState>) {
      const prevState = cloneObject(state)
      const newState = resolveState(stateResolvable, prevState)
      const outputState = invokeMiddlewares(middlewares, prevState, newState)

      Object.assign(this.state, outputState)

      return {
        state: outputState,
        prevState,
        setState: this.setState,
      }
    },
  }

  return handler
}

export { create }
export type { Patch, Selector, StateCreator, SetState }
