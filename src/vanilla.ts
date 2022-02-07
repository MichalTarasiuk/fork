import {
  createObserver,
  buildOf,
  resolveState,
  equals,
  isFunction,
  cloneObject,
  isMiddleware,
} from 'src/utils'
import type { StateResolvable, Listener } from 'src/utils'
import type { StateCreator, SetState, Selector } from 'src/factory'
import type { DeepPartial } from 'src/typings'

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
    listener = selector ? customListener(listener, selector) : listener

    const subscriber = observer.subscribe(listener)

    return {
      unsubscribe: subscriber.unsubscribe,
    }
  }

  const setState: SetState<TState> = (patch, replace = false) => {
    patch = isFunction(patch) ? patch(store.state) : patch

    const { state: newState, prevState } = store.setState((prevState) => {
      const newState = replace
        ? (patch as TState)
        : buildOf(prevState, patch as DeepPartial<TState>)

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
        return observer.getListeners
      },
    },
    reset,
    setState,
    destroy,
    subscribe,
  }
}

const invokeMiddlewares = <TState>(
  stateWithMiddlewares: TState,
  prevState?: TState,
  newState?: TState
): TState => {
  const cloneState: any = cloneObject(newState || stateWithMiddlewares)
  const initial = !prevState && !newState

  Object.entries(stateWithMiddlewares).forEach(([key, value]) => {
    const prevValue = prevState && (prevState as any)[key]
    const newValue = newState && (newState as any)[key]

    if (isMiddleware(key, value)) {
      const middleware = value
      const { value: middlewareValue, next } = middleware(newValue)
      const condition = next || initial

      cloneState[key] = condition ? middlewareValue : prevValue
    }
  })

  return cloneState
}

const setUpStore = <TState>(
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  const stateWithMiddlewares = isFunction(stateCreator)
    ? stateCreator(setState)
    : stateCreator
  const state = invokeMiddlewares(stateWithMiddlewares)

  const handler = {
    state,
    prevState: undefined,
    setState(stateResolvable: StateResolvable<TState>) {
      const prevState = cloneObject(state)
      const newState = resolveState(stateResolvable, prevState)
      const outputState = invokeMiddlewares(
        stateWithMiddlewares,
        prevState,
        newState
      )

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
