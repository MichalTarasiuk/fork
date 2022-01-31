import {
  createObserver,
  buildOf,
  resolveState,
  equals,
  isFunction,
  cloneObject,
  isMiddleware,
} from 'src/utils'
import type { StateResolvable } from 'src/utils'

type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
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

export type StateCreator<TState> = ((set: SetState<TState>) => TState) | TState
export type Selector<TState extends Record<string, any>> = (
  state: TState
) => any

const create = <TState>(stateCreator: StateCreator<TState>) => {
  let store: ReturnType<SetUpStore<TState>>
  const observer = createObserver<TState>()
  type Listener = Parameters<typeof observer.subscribe>[0]

  const customListener = (listener: Listener, selector: Selector<TState>) => {
    return (newState: TState, prevState?: TState) => {
      const newSlice = selector(newState)

      if (prevState) {
        const oldSlice = selector(prevState)

        !equals(newSlice, oldSlice) && listener(newState, prevState)
      }
    }
  }

  const subscribe = (listener: Listener, selector?: Selector<TState>) => {
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

    observer.notify(newState, prevState)
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
    get getState() {
      return store.state
    },
    get listeners() {
      return observer.listeners
    },
    reset,
    setState,
    destroy,
    subscribe,
  }
}

const invokeMiddleweres = <TState>(
  stateWithMiddleweres: TState,
  prevState?: TState,
  newState?: TState
): TState => {
  const cloneState: any = cloneObject(newState || stateWithMiddleweres)
  const initial = !prevState && !newState

  for (const [key, value] of Object.entries(stateWithMiddleweres)) {
    const prevValue = prevState && (prevState as any)[key]
    const newValue = newState && (newState as any)[key]

    if (isMiddleware(key, value)) {
      const middleware = value
      const { value: middlewareValue, next } = middleware(newValue)
      const condition = next || initial

      cloneState[key] = condition ? middlewareValue : prevValue
    }
  }

  return cloneState
}

const setUpStore = <TState>(
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  const stateWithMiddleweres = isFunction(stateCreator)
    ? stateCreator(setState)
    : stateCreator
  const state = invokeMiddleweres(stateWithMiddleweres)

  const handler = {
    state,
    prevState: undefined,
    setState(stateResolvable: StateResolvable<TState>) {
      const prevState = cloneObject(state)
      const newState = resolveState(stateResolvable, prevState)
      const outputState = invokeMiddleweres(
        stateWithMiddleweres,
        prevState,
        newState
      )

      this.state = Object.assign(this.state, outputState)

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
